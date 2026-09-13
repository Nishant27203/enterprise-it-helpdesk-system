import { Search } from 'lucide-react';

const TicketFilters = ({ filters, onChange, showAssignee = false, technicians = [] }) => (
  <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex-1 min-w-[200px]">
      <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Ticket # or title..."
          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500"
        />
      </div>
    </div>
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All</option>
        {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER', 'ESCALATED', 'RESOLVED', 'CLOSED'].map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
      <select
        value={filters.priority || ''}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">All</option>
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
    {showAssignee && (
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Technician</label>
        <select
          value={filters.assignedToId || ''}
          onChange={(e) => onChange({ ...filters, assignedToId: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
          ))}
        </select>
      </div>
    )}
  </div>
);

export default TicketFilters;
