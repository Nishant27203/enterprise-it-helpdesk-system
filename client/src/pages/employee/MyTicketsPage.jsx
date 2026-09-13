import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TicketTable from '../../components/tickets/TicketTable';
import TicketFilters from '../../components/tickets/TicketFilters';
import Pagination from '../../components/common/Pagination';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useDebounce } from '../../hooks/useDebounce';
import { getTickets } from '../../services/ticketService';

const MyTicketsPage = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [data, setData] = useState({ tickets: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(filters.search);

  useEffect(() => {
    setLoading(true);
    getTickets({ ...filters, search: debouncedSearch })
      .then((res) => { setData({ tickets: res.data, meta: res.meta }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedSearch, filters.status, filters.priority, filters.page]);

  return (
    <DashboardLayout title="My Tickets">
      <div className="mb-4 flex justify-end">
        <Link to="/employee/tickets/new" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">+ New Ticket</Link>
      </div>
      <TicketFilters filters={filters} onChange={(f) => setFilters({ ...f, page: 1 })} />
      <Card className="mt-4">
        {loading ? <div className="flex justify-center py-12"><LoadingSpinner /></div> : (
          <>
            <TicketTable tickets={data.tickets} basePath="/employee/tickets" />
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={(p) => setFilters({ ...filters, page: p })} />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default MyTicketsPage;
