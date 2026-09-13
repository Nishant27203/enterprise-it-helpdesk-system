import api from './api';

export const getCategories = () => api.get('/categories').then((r) => r.data.data);
export const getDepartments = () => api.get('/departments').then((r) => r.data.data);
export const getSlaPolicies = () => api.get('/sla-policies').then((r) => r.data.data);
export const updateSlaPolicy = (id, data) => api.patch(`/sla-policies/${id}`, data).then((r) => r.data.data);
