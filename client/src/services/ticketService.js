import api from './api';

export const getTickets = (params) => api.get('/tickets', { params }).then((r) => r.data);
export const getTicket = (id) => api.get(`/tickets/${id}`).then((r) => r.data.data);
export const createTicket = (data) => api.post('/tickets', data).then((r) => r.data.data);
export const updateTicket = (id, data) => api.patch(`/tickets/${id}`, data).then((r) => r.data.data);
export const acceptTicket = (id) => api.post(`/tickets/${id}/accept`).then((r) => r.data.data);
export const assignTicket = (id, assignedToId) => api.post(`/tickets/${id}/assign`, { assignedToId }).then((r) => r.data.data);
export const changeStatus = (id, status, notes) => api.post(`/tickets/${id}/status`, { status, notes }).then((r) => r.data.data);
export const addComment = (id, content, isInternal = false) => api.post(`/tickets/${id}/comments`, { content, isInternal }).then((r) => r.data.data);
export const getComments = (id) => api.get(`/tickets/${id}/comments`).then((r) => r.data.data);
export const escalateTicket = (id, data) => api.post(`/tickets/${id}/escalate`, data).then((r) => r.data.data);
export const resolveTicket = (id, data) => api.post(`/tickets/${id}/resolve`, data).then((r) => r.data.data);
export const closeTicket = (id) => api.post(`/tickets/${id}/close`).then((r) => r.data.data);
export const submitFeedback = (id, rating, comment) => api.post(`/tickets/${id}/feedback`, { rating, comment }).then((r) => r.data.data);
export const getHistory = (id) => api.get(`/tickets/${id}/history`).then((r) => r.data.data);
