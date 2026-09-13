export const isIT = (role) => ['IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN'].includes(role);
export const isManager = (role) => ['IT_MANAGER', 'ADMIN'].includes(role);
export const isAdmin = (role) => role === 'ADMIN';
