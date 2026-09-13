import api from './api';

export const getStats = () => api.get('/dashboard/stats').then((r) => r.data.data);
export const getChartStatus = () => api.get('/dashboard/charts/status').then((r) => r.data.data);
export const getChartPriority = () => api.get('/dashboard/charts/priority').then((r) => r.data.data);
export const getChartCategory = () => api.get('/dashboard/charts/category').then((r) => r.data.data);
export const getChartDepartment = () => api.get('/dashboard/charts/department').then((r) => r.data.data);
export const getChartTechnician = () => api.get('/dashboard/charts/technician').then((r) => r.data.data);
export const getReports = () => api.get('/dashboard/reports').then((r) => r.data.data);
