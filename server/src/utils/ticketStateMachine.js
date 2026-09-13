import { ApiError } from './ApiError.js';

const VALID_TRANSITIONS = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['PENDING_USER', 'ESCALATED', 'RESOLVED'],
  PENDING_USER: ['IN_PROGRESS'],
  ESCALATED: ['IN_PROGRESS'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export const assertValidTransition = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw ApiError.conflict(
      `Invalid status transition from ${currentStatus} to ${newStatus}`
    );
  }
};

export const canTransition = (currentStatus, newStatus) => {
  return (VALID_TRANSITIONS[currentStatus] || []).includes(newStatus);
};
