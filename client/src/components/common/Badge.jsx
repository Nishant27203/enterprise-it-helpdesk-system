import clsx from 'clsx';

const STATUS_STYLES = {
  OPEN: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  PENDING_USER: 'bg-orange-100 text-orange-800',
  ESCALATED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const PRIORITY_STYLES = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-slate-400 text-white',
};

export const StatusBadge = ({ status }) => (
  <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[status])}>
    {status?.replace(/_/g, ' ')}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', PRIORITY_STYLES[priority])}>
    {priority}
  </span>
);
