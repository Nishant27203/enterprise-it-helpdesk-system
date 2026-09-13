import { useState, useEffect, useCallback } from 'react';
import * as notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications({ limit: 10 });
      setNotifications(res.data);
      setUnreadCount(res.meta?.unreadCount || 0);
    } catch {
      /* ignore polling errors */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await notificationService.markRead(id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    fetchNotifications();
  };

  return { notifications, unreadCount, markAsRead, markAllRead, refresh: fetchNotifications };
};
