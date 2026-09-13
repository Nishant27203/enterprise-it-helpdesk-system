import { formatDate } from '../../utils/formatters';

const ACTION_LABELS = {
  TICKET_CREATED: 'Ticket created',
  STATUS_CHANGED: 'Status changed',
  PRIORITY_CHANGED: 'Priority changed',
  ASSIGNED: 'Ticket assigned',
  REASSIGNED: 'Ticket reassigned',
  COMMENT_ADDED: 'Comment added',
  ESCALATED: 'Ticket escalated',
  RESOLVED: 'Ticket resolved',
  CLOSED: 'Ticket closed',
  SLA_BREACHED: 'SLA breached',
  FEEDBACK_SUBMITTED: 'Feedback submitted',
};

const TicketActivityTimeline = ({ history }) => {
  if (!history?.length) return <p className="text-sm text-slate-400">No activity yet.</p>;

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
          <div>
            <p className="text-sm font-medium text-slate-900">
              {ACTION_LABELS[entry.action] || entry.action}
            </p>
            <p className="text-xs text-slate-500">
              {entry.actor?.firstName} {entry.actor?.lastName} · {formatDate(entry.createdAt)}
            </p>
            {entry.metadata && (
              <p className="mt-1 text-xs text-slate-400">
                {JSON.stringify(entry.metadata).replace(/[{}"]/g, '').replace(/,/g, ', ')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketActivityTimeline;
