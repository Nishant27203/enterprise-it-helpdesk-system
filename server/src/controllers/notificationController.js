import * as notificationService from '../services/notificationService.js';

export const list = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await notificationService.getUserNotifications(req.user.id, { page, limit });
  res.json({
    success: true,
    data: result.notifications,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      unreadCount: result.unreadCount,
    },
  });
};

export const markRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Notification not found' },
    });
  }
  res.json({ success: true, data: notification });
};

export const markAllRead = async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.json({ success: true, data: { message: 'All notifications marked as read' } });
};
