import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TicketTable from '../../components/tickets/TicketTable';
import TicketFilters from '../../components/tickets/TicketFilters';
import Pagination from '../../components/common/Pagination';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useDebounce } from '../../hooks/useDebounce';
import { getTickets } from '../../services/ticketService';

const AssignedTicketsPage = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 20, queue: 'assigned' });
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
    <DashboardLayout title="Assigned Tickets">
      <TicketFilters filters={filters} onChange={(f) => setFilters({ ...f, page: 1, queue: 'assigned' })} />
      <Card className="mt-4">
        {loading ? <div className="flex justify-center py-12"><LoadingSpinner /></div> : (
          <>
            <TicketTable tickets={data.tickets} basePath="/technician/tickets" />
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={(p) => setFilters({ ...filters, page: p })} />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default AssignedTicketsPage;
