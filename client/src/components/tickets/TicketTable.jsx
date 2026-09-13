import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

const TicketTable = ({ tickets, basePath = '/employee/tickets' }) => {
  if (!tickets?.length) return <EmptyState title="No tickets found" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Ticket #</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 hidden md:table-cell">Assignee</th>
            <th className="px-4 py-3 hidden lg:table-cell">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`${basePath}/${t.id}`} className="font-mono text-xs font-medium text-primary-600 hover:underline">
                  {t.ticketNumber}
                </Link>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-slate-900">{t.title}</td>
              <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : '—'}
              </td>
              <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">{formatDate(t.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
