import api from './api';

export const getUsers = (params) => api.get('/users', { params }).then((r) => r.data);
export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data.data);
export const createUser = (data) => api.post('/users', data).then((r) => r.data.data);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data).then((r) => r.data.data);
export const getTechnicians = () => api.get('/users/technicians').then((r) => r.data.data);
