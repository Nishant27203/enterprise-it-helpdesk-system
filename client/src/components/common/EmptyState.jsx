import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Inbox className="mb-3 h-10 w-10 text-slate-300" />
    <p className="text-sm font-medium text-slate-600">{title}</p>
    {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
  </div>
);

export default EmptyState;
