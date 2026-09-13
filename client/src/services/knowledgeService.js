import api from './api';

export const getArticles = (params) => api.get('/knowledge-base', { params }).then((r) => r.data);
export const getArticle = (id) => api.get(`/knowledge-base/${id}`).then((r) => r.data.data);
export const createArticle = (data) => api.post('/knowledge-base', data).then((r) => r.data.data);
export const updateArticle = (id, data) => api.patch(`/knowledge-base/${id}`, data).then((r) => r.data.data);
export const deleteArticle = (id) => api.delete(`/knowledge-base/${id}`).then((r) => r.data);
