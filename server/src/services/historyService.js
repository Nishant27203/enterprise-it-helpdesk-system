import prisma from '../config/prisma.js';

export const createHistory = async (tx, { ticketId, actorId, action, metadata = null }) => {
  const client = tx || prisma;
  return client.ticketHistory.create({
    data: { ticketId, actorId, action, metadata },
    include: {
      actor: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });
};

export const getTicketHistory = async (ticketId) => {
  return prisma.ticketHistory.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'asc' },
    include: {
      actor: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });
};
