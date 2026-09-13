import api from './api';

export const getNotifications = (params) => api.get('/notifications', { params }).then((r) => r.data);
export const markRead = (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data);
export const markAllRead = () => api.patch('/notifications/read-all').then((r) => r.data);
