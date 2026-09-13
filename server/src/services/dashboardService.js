import prisma from '../config/prisma.js';
import { getSlaStatus } from './slaService.js';

export const getDashboardStats = async () => {
  const [
    total,
    open,
    assigned,
    inProgress,
    pendingUser,
    escalated,
    resolved,
    closed,
    critical,
    high,
    allActiveTickets,
    resolvedTickets,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.ticket.count({ where: { status: 'ASSIGNED' } }),
    prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { status: 'PENDING_USER' } }),
    prisma.ticket.count({ where: { status: 'ESCALATED' } }),
    prisma.ticket.count({ where: { status: 'RESOLVED' } }),
    prisma.ticket.count({ where: { status: 'CLOSED' } }),
    prisma.ticket.count({ where: { priority: 'CRITICAL', status: { notIn: ['CLOSED'] } } }),
    prisma.ticket.count({ where: { priority: 'HIGH', status: { notIn: ['CLOSED'] } } }),
    prisma.ticket.findMany({
      where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        slaResolutionDue: true,
        resolvedAt: true,
      },
    }),
    prisma.ticket.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true, slaResolutionDue: true },
    }),
  ]);

  let slaBreached = 0;
  for (const ticket of allActiveTickets) {
    if (getSlaStatus(ticket) === 'BREACHED') slaBreached++;
  }

  let slaCompliant = 0;
  let totalResolutionMs = 0;
  for (const ticket of resolvedTickets) {
    if (ticket.resolvedAt && ticket.resolvedAt <= ticket.slaResolutionDue) slaCompliant++;
    if (ticket.resolvedAt) {
      totalResolutionMs += ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
    }
  }

  const slaCompliancePercent =
    resolvedTickets.length > 0
      ? Math.round((slaCompliant / resolvedTickets.length) * 100)
      : 100;

  const avgResolutionHours =
    resolvedTickets.length > 0
      ? Math.round((totalResolutionMs / resolvedTickets.length / 3600000) * 10) / 10
      : 0;

  return {
    totalTickets: total,
    openTickets: open,
    assignedTickets: assigned,
    inProgressTickets: inProgress,
    pendingUserTickets: pendingUser,
    escalatedTickets: escalated,
    resolvedTickets: resolved,
    closedTickets: closed,
    criticalTickets: critical,
    highPriorityTickets: high,
    slaBreachedTickets: slaBreached,
    slaCompliancePercent,
    avgResolutionHours,
  };
};

const groupByField = async (field) => {
  const results = await prisma.ticket.groupBy({
    by: [field],
    _count: { id: true },
  });
  return results.map((r) => ({ name: r[field], count: r._count.id }));
};

export const getChartByStatus = () => groupByField('status');
export const getChartByPriority = () => groupByField('priority');

export const getChartByCategory = async () => {
  const results = await prisma.ticket.groupBy({
    by: ['categoryId'],
    _count: { id: true },
  });
  const categories = await prisma.category.findMany({
    where: { id: { in: results.map((r) => r.categoryId) } },
  });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return results.map((r) => ({
    name: catMap[r.categoryId] || 'Unknown',
    count: r._count.id,
  }));
};

export const getChartByDepartment = async () => {
  const results = await prisma.ticket.groupBy({
    by: ['departmentId'],
    _count: { id: true },
  });
  const departments = await prisma.department.findMany({
    where: { id: { in: results.map((r) => r.departmentId) } },
  });
  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));
  return results.map((r) => ({
    name: deptMap[r.departmentId] || 'Unknown',
    count: r._count.id,
  }));
};

export const getChartByTechnician = async () => {
  const results = await prisma.ticket.groupBy({
    by: ['assignedToId'],
    _count: { id: true },
    where: { assignedToId: { not: null } },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: results.map((r) => r.assignedToId) } },
  });
  const userMap = Object.fromEntries(
    users.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
  );
  return results.map((r) => ({
    name: userMap[r.assignedToId] || 'Unassigned',
    count: r._count.id,
  }));
};

export const getReports = async () => {
  const stats = await getDashboardStats();
  const [byPriority, byCategory, byTechnician, byDepartment] = await Promise.all([
    getChartByPriority(),
    getChartByCategory(),
    getChartByTechnician(),
    getChartByDepartment(),
  ]);

  return {
    ...stats,
    ticketsByPriority: byPriority,
    ticketsByCategory: byCategory,
    technicianPerformance: byTechnician,
    departmentVolume: byDepartment,
  };
};
