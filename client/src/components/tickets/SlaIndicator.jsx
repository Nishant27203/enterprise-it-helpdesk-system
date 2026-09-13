import clsx from 'clsx';
import { Clock, AlertTriangle } from 'lucide-react';
import { SLA_COLORS, SLA_LABELS, getSlaPercentRemaining } from '../../utils/slaHelpers';
import { formatDate } from '../../utils/formatters';

const SlaIndicator = ({ ticket }) => {
  const status = ticket.slaStatus || 'ON_TRACK';
  const percent = getSlaPercentRemaining(ticket);

  return (
    <div className={clsx('rounded-lg border p-3', SLA_COLORS[status])}>
      <div className="flex items-center gap-2">
        {status === 'BREACHED' ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="text-xs font-semibold">{SLA_LABELS[status]}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/50">
        <div
          className={clsx('h-full rounded-full transition-all', {
            'bg-green-500': status === 'ON_TRACK',
            'bg-amber-500': status === 'AT_RISK',
            'bg-red-500': status === 'BREACHED',
          })}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs opacity-80">Due: {formatDate(ticket.slaResolutionDue)}</p>
    </div>
  );
};

export default SlaIndicator;
