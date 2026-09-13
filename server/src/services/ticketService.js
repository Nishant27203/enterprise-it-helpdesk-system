import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { assertValidTransition } from '../utils/ticketStateMachine.js';
import { canViewAllTickets, canAssignTickets, isITUser } from '../utils/permissions.js';
import { generateTicketNumber } from './ticketNumberService.js';
import { calculateSlaDueDates, enrichTicketWithSla, enrichTicketsWithSla } from './slaService.js';
import { createHistory } from './historyService.js';
import { createNotification, notifyManagers } from './notificationService.js';

const ticketInclude = {
  category: { select: { id: true, name: true } },
  subcategory: { select: { id: true, name: true } },
  requester: { select: { id: true, firstName: true, lastName: true, email: true, departmentId: true } },
  department: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, escalationLevel: true } },
  slaPolicy: { select: { id: true, priority: true, responseTimeMinutes: true, resolutionTimeMinutes: true } },
};

const assertTicketAccess = async (ticket, user) => {
  if (canViewAllTickets(user.role)) return;

  if (user.role === 'EMPLOYEE') {
    if (ticket.requesterId !== user.id) {
      throw ApiError.forbidden('You can only access your own tickets');
    }
    return;
  }

  if (user.role === 'IT_TECHNICIAN') {
    const isAssigned = ticket.assignedToId === user.id;
    const isUnassigned = !ticket.assignedToId && ticket.status === 'OPEN';
    if (!isAssigned && !isUnassigned) {
      throw ApiError.forbidden('You can only access assigned or unassigned queue tickets');
    }
  }
};

const getTicketOrThrow = async (ticketId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: ticketInclude,
  });
  if (!ticket) throw ApiError.notFound('Ticket not found');
  return ticket;
};

const buildTicketWhere = (user, filters) => {
  const where = {};
  const andConditions = [];

  if (user.role === 'EMPLOYEE') {
    where.requesterId = user.id;
  } else if (user.role === 'IT_TECHNICIAN') {
    if (filters.queue === 'unassigned') {
      andConditions.push({ status: 'OPEN', assignedToId: null });
    } else if (filters.queue === 'assigned') {
      andConditions.push({ assignedToId: user.id });
    } else {
      andConditions.push({
        OR: [
          { assignedToId: user.id },
          { status: 'OPEN', assignedToId: null },
        ],
      });
    }
  }

  if (filters.search) {
    andConditions.push({
      OR: [
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.status?.length) where.status = { in: filters.status };
  if (filters.priority?.length) where.priority = { in: filters.priority };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.requesterId && canViewAllTickets(user.role)) {
    where.requesterId = filters.requesterId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  if (andConditions.length) where.AND = andConditions;
  return where;
};

export const createTicket = async (user, data) => {
  const subcategory = await prisma.subcategory.findUnique({
    where: { id: data.subcategoryId },
    include: { category: true },
  });

  if (!subcategory || subcategory.categoryId !== data.categoryId) {
    throw ApiError.badRequest('Invalid category/subcategory combination');
  }

  const slaPolicy = await prisma.sLAPolicy.findFirst({
    where: { priority: data.priority, isActive: true },
  });

  if (!slaPolicy) throw ApiError.badRequest('No SLA policy found for priority');

  const slaDates = calculateSlaDueDates(slaPolicy);

  if (!user.departmentId) {
    throw ApiError.badRequest('Your account has no department assigned. Contact IT admin.');
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const ticketNumber = await generateTicketNumber(tx);

    const created = await tx.ticket.create({
      data: {
        ticketNumber,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        priority: data.priority,
        requesterId: user.id,
        departmentId: user.departmentId,
        slaPolicyId: slaPolicy.id,
        slaResponseDue: slaDates.slaResponseDue,
        slaResolutionDue: slaDates.slaResolutionDue,
      },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId: created.id,
      actorId: user.id,
      action: 'TICKET_CREATED',
      metadata: { ticketNumber, priority: data.priority },
    });

    await notifyManagers(tx, {
      ticketId: created.id,
      type: 'TICKET_CREATED',
      title: 'New Ticket Created',
      message: `${ticketNumber}: ${data.title}`,
    });

    return created;
  });

  return enrichTicketWithSla(ticket);
};

export const listTickets = async (user, filters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';

  const where = buildTicketWhere(user, filters);

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: ticketInclude,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets: enrichTicketsWithSla(tickets),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getTicketById = async (ticketId, user) => {
  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);
  return enrichTicketWithSla(ticket);
};

export const updateTicket = async (ticketId, user, data) => {
  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);

  if (user.role === 'EMPLOYEE') {
    throw ApiError.forbidden('Employees cannot update ticket details');
  }

  const updates = {};
  const historyEntries = [];

  if (data.priority && data.priority !== ticket.priority) {
    updates.priority = data.priority;
    const slaPolicy = await prisma.sLAPolicy.findFirst({
      where: { priority: data.priority, isActive: true },
    });
    if (slaPolicy) {
      const slaDates = calculateSlaDueDates(slaPolicy, ticket.createdAt);
      updates.slaPolicyId = slaPolicy.id;
      updates.slaResponseDue = slaDates.slaResponseDue;
      updates.slaResolutionDue = slaDates.slaResolutionDue;
    }
    historyEntries.push({
      action: 'PRIORITY_CHANGED',
      metadata: { from: ticket.priority, to: data.priority },
    });
  }

  if (data.troubleshootingNotes !== undefined) {
    updates.troubleshootingNotes = data.troubleshootingNotes;
  }

  if (data.rootCause !== undefined) {
    updates.rootCause = data.rootCause;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: updates,
      include: ticketInclude,
    });

    for (const entry of historyEntries) {
      await createHistory(tx, {
        ticketId,
        actorId: user.id,
        ...entry,
      });
    }

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const acceptTicket = async (ticketId, user) => {
  if (!isITUser(user.role)) throw ApiError.forbidden();

  const ticket = await getTicketOrThrow(ticketId);

  if (ticket.status !== 'OPEN' || ticket.assignedToId) {
    throw ApiError.conflict('Ticket is not available to accept');
  }

  assertValidTransition(ticket.status, 'ASSIGNED');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: user.id, status: 'ASSIGNED' },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'ASSIGNED',
      metadata: { assignedToId: user.id, method: 'accept' },
    });

    await createNotification(tx, {
      userId: ticket.requesterId,
      ticketId,
      type: 'TICKET_ASSIGNED',
      title: 'Ticket Assigned',
      message: `${ticket.ticketNumber} has been assigned to a technician`,
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const assignTicket = async (ticketId, user, { assignedToId }) => {
  if (!canAssignTickets(user.role) && user.role !== 'IT_TECHNICIAN') {
    throw ApiError.forbidden('You cannot assign tickets');
  }

  const ticket = await getTicketOrThrow(ticketId);
  const technician = await prisma.user.findFirst({
    where: { id: assignedToId, role: { in: ['IT_TECHNICIAN', 'IT_MANAGER'] }, isActive: true },
  });

  if (!technician) throw ApiError.badRequest('Invalid technician');

  const newStatus = ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status;
  if (ticket.status === 'OPEN') assertValidTransition('OPEN', 'ASSIGNED');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: { assignedToId, status: newStatus },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: ticket.assignedToId ? 'REASSIGNED' : 'ASSIGNED',
      metadata: { from: ticket.assignedToId, to: assignedToId },
    });

    await createNotification(tx, {
      userId: assignedToId,
      ticketId,
      type: 'TICKET_ASSIGNED',
      title: 'Ticket Assigned to You',
      message: `${ticket.ticketNumber}: ${ticket.title}`,
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const changeStatus = async (ticketId, user, { status, notes }) => {
  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);

  if (user.role === 'EMPLOYEE') throw ApiError.forbidden();

  assertValidTransition(ticket.status, status);

  const updates = { status };
  const now = new Date();

  if (status === 'IN_PROGRESS' && !ticket.firstResponseAt) {
    updates.firstResponseAt = now;
  }

  if (notes) {
    updates.troubleshootingNotes = ticket.troubleshootingNotes
      ? `${ticket.troubleshootingNotes}\n\n[${now.toISOString()}] ${notes}`
      : notes;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: updates,
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'STATUS_CHANGED',
      metadata: { from: ticket.status, to: status, notes },
    });

    await createNotification(tx, {
      userId: ticket.requesterId,
      ticketId,
      type: 'STATUS_CHANGED',
      title: 'Ticket Status Updated',
      message: `${ticket.ticketNumber} status changed to ${status}`,
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const addComment = async (ticketId, user, { content, isInternal = false }) => {
  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);

  if (user.role === 'EMPLOYEE' && isInternal) {
    throw ApiError.forbidden('Employees cannot create internal notes');
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.ticketComment.create({
      data: { ticketId, authorId: user.id, content, isInternal },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'COMMENT_ADDED',
      metadata: { isInternal, preview: content.substring(0, 100) },
    });

    if (!isInternal) {
      const notifyUserId =
        user.id === ticket.requesterId ? ticket.assignedToId : ticket.requesterId;

      if (notifyUserId) {
        await createNotification(tx, {
          userId: notifyUserId,
          ticketId,
          type: 'COMMENT_ADDED',
          title: 'New Comment on Ticket',
          message: `${ticket.ticketNumber}: new comment added`,
        });
      }

      if (!ticket.firstResponseAt && isITUser(user.role)) {
        await tx.ticket.update({
          where: { id: ticketId },
          data: { firstResponseAt: new Date() },
        });
      }
    }

    return created;
  });

  return comment;
};

export const getComments = async (ticketId, user) => {
  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);

  const where = { ticketId };
  if (user.role === 'EMPLOYEE') {
    where.isInternal = false;
  }

  return prisma.ticketComment.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });
};

export const escalateTicket = async (ticketId, user, { toLevel, escalatedToId, reason, notes }) => {
  if (!isITUser(user.role)) throw ApiError.forbidden();

  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);

  const levelOrder = { L1: 1, L2: 2, L3: 3 };
  if (levelOrder[toLevel] <= levelOrder[ticket.escalationLevel]) {
    throw ApiError.badRequest('Escalation level must be higher than current level');
  }

  if (ticket.status !== 'IN_PROGRESS' && ticket.status !== 'ESCALATED') {
    assertValidTransition(ticket.status, 'ESCALATED');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.escalation.create({
      data: {
        ticketId,
        escalatedById: user.id,
        escalatedToId: escalatedToId || null,
        fromLevel: ticket.escalationLevel,
        toLevel,
        reason,
        notes,
      },
    });

    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: { escalationLevel: toLevel, status: 'ESCALATED' },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'ESCALATED',
      metadata: { fromLevel: ticket.escalationLevel, toLevel, reason },
    });

    if (escalatedToId) {
      await createNotification(tx, {
        userId: escalatedToId,
        ticketId,
        type: 'TICKET_ESCALATED',
        title: 'Ticket Escalated to You',
        message: `${ticket.ticketNumber} escalated to ${toLevel}`,
      });
    }

    await notifyManagers(tx, {
      ticketId,
      type: 'TICKET_ESCALATED',
      title: 'Ticket Escalated',
      message: `${ticket.ticketNumber} escalated from ${ticket.escalationLevel} to ${toLevel}`,
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const resolveTicket = async (ticketId, user, { resolutionNotes, rootCause, troubleshootingNotes }) => {
  if (!isITUser(user.role)) throw ApiError.forbidden();

  const ticket = await getTicketOrThrow(ticketId);
  await assertTicketAccess(ticket, user);

  assertValidTransition(ticket.status, 'RESOLVED');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolutionNotes,
        rootCause,
        troubleshootingNotes,
      },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'RESOLVED',
      metadata: { resolutionNotes, rootCause },
    });

    await createNotification(tx, {
      userId: ticket.requesterId,
      ticketId,
      type: 'TICKET_RESOLVED',
      title: 'Ticket Resolved',
      message: `${ticket.ticketNumber} has been resolved. Please review and close.`,
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const closeTicket = async (ticketId, user) => {
  const ticket = await getTicketOrThrow(ticketId);

  if (user.role === 'EMPLOYEE' && ticket.requesterId !== user.id) {
    throw ApiError.forbidden();
  }

  if (ticket.status !== 'RESOLVED') {
    throw ApiError.conflict('Only resolved tickets can be closed');
  }

  assertValidTransition(ticket.status, 'CLOSED');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', closedAt: new Date() },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'CLOSED',
      metadata: {},
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export const submitFeedback = async (ticketId, user, { rating, comment }) => {
  const ticket = await getTicketOrThrow(ticketId);

  if (ticket.requesterId !== user.id) {
    throw ApiError.forbidden('Only the requester can submit feedback');
  }

  if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
    throw ApiError.conflict('Feedback can only be submitted for resolved or closed tickets');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ticket.update({
      where: { id: ticketId },
      data: { satisfactionRating: rating, feedbackComment: comment },
      include: ticketInclude,
    });

    await createHistory(tx, {
      ticketId,
      actorId: user.id,
      action: 'FEEDBACK_SUBMITTED',
      metadata: { rating },
    });

    return result;
  });

  return enrichTicketWithSla(updated);
};

export { getTicketHistory } from './historyService.js';
