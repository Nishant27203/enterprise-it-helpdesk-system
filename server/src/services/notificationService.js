import prisma from '../config/prisma.js';

export const createNotification = async (tx, { userId, ticketId, type, title, message }) => {
  const client = tx || prisma;
  return client.notification.create({
    data: { userId, ticketId, type, title, message },
  });
};

export const notifyManagers = async (tx, { ticketId, type, title, message }) => {
  const client = tx || prisma;
  const managers = await client.user.findMany({
    where: { role: { in: ['IT_MANAGER', 'ADMIN'] }, isActive: true },
    select: { id: true },
  });

  for (const manager of managers) {
    await createNotification(tx, {
      userId: manager.id,
      ticketId,
      type,
      title,
      message,
    });
  }
};

export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        ticket: { select: { id: true, ticketNumber: true, title: true } },
      },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return { notifications, total, unreadCount, page, limit };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) return null;

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const hasRecentNotification = async (ticketId, userId, type, sinceMinutes = 60) => {
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: {
      ticketId,
      userId,
      type,
      createdAt: { gte: since },
    },
  });
  return !!existing;
};

export const hasSlaBreachHistory = async (ticketId) => {
  const existing = await prisma.ticketHistory.findFirst({
    where: { ticketId, action: 'SLA_BREACHED' },
  });
  return !!existing;
};
