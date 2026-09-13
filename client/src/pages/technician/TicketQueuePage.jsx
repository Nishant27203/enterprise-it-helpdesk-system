import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TicketTable from '../../components/tickets/TicketTable';
import Pagination from '../../components/common/Pagination';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTickets } from '../../services/ticketService';

const TicketQueuePage = () => {
  const [data, setData] = useState({ tickets: [], meta: {} });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTickets({ queue: 'unassigned', page, limit: 20 })
      .then((res) => { setData({ tickets: res.data, meta: res.meta }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <DashboardLayout title="Unassigned Queue">
      <Card title="Open Unassigned Tickets">
        {loading ? <div className="flex justify-center py-12"><LoadingSpinner /></div> : (
          <>
            <TicketTable tickets={data.tickets} basePath="/technician/tickets" />
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default TicketQueuePage;
