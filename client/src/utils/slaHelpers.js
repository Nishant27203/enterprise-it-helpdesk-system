export const SLA_COLORS = {
  ON_TRACK: 'text-green-700 bg-green-50 border-green-200',
  AT_RISK: 'text-amber-700 bg-amber-50 border-amber-200',
  BREACHED: 'text-red-700 bg-red-50 border-red-200',
};

export const SLA_LABELS = {
  ON_TRACK: 'On Track',
  AT_RISK: 'At Risk',
  BREACHED: 'Breached',
};

export const getSlaPercentRemaining = (ticket) => {
  if (!ticket?.slaResolutionDue || !ticket?.createdAt) return 100;
  const now = Date.now();
  const created = new Date(ticket.createdAt).getTime();
  const due = new Date(ticket.slaResolutionDue).getTime();
  const total = due - created;
  const remaining = due - now;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
};
