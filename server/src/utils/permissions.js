const IT_ROLES = ['IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN'];
const MANAGER_ROLES = ['IT_MANAGER', 'ADMIN'];

export const isITUser = (role) => IT_ROLES.includes(role);
export const isManagerOrAdmin = (role) => MANAGER_ROLES.includes(role);
export const isAdmin = (role) => role === 'ADMIN';

export const canViewAllTickets = (role) => MANAGER_ROLES.includes(role) || role === 'ADMIN';

export const canAssignTickets = (role) => MANAGER_ROLES.includes(role);

export const canManageUsers = (role) => role === 'ADMIN';

export const canManageSLA = (role) => role === 'ADMIN';

export const canWriteKnowledge = (role) => IT_ROLES.includes(role);
