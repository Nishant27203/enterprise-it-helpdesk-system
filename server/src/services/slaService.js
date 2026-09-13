export const calculateSlaDueDates = (policy, createdAt = new Date()) => {
  const base = new Date(createdAt);
  return {
    slaResponseDue: new Date(base.getTime() + policy.responseTimeMinutes * 60 * 1000),
    slaResolutionDue: new Date(base.getTime() + policy.resolutionTimeMinutes * 60 * 1000),
  };
};

export const getSlaStatus = (ticket) => {
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    return 'ON_TRACK';
  }

  const now = new Date();
  const createdAt = new Date(ticket.createdAt);
  const resolutionDue = new Date(ticket.slaResolutionDue);

  if (now > resolutionDue) {
    return 'BREACHED';
  }

  const totalDuration = resolutionDue.getTime() - createdAt.getTime();
  const remaining = resolutionDue.getTime() - now.getTime();

  if (totalDuration > 0 && remaining / totalDuration <= 0.25) {
    return 'AT_RISK';
  }

  return 'ON_TRACK';
};

export const enrichTicketWithSla = (ticket) => ({
  ...ticket,
  slaStatus: getSlaStatus(ticket),
});

export const enrichTicketsWithSla = (tickets) => tickets.map(enrichTicketWithSla);
