import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTickets } from '../../services/ticketService';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTickets({ limit: 100 }),
      getTickets({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    ]).then(([all, rec]) => {
      const tickets = all.data || [];
      setStats({
        open: tickets.filter((t) => ['OPEN', 'ASSIGNED'].includes(t.status)).length,
        inProgress: tickets.filter((t) => ['IN_PROGRESS', 'PENDING_USER', 'ESCALATED'].includes(t.status)).length,
        resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
        total: tickets.length,
      });
      setRecent(rec.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Employee Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Employee Dashboard">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My Open Tickets" value={stats.open} />
        <StatCard label="In Progress" value={stats.inProgress} color="text-amber-600" />
        <StatCard label="Resolved" value={stats.resolved} color="text-green-600" />
        <StatCard label="Total Tickets" value={stats.total} />
      </div>
      <Card title="Recent Tickets" action={<Link to="/employee/tickets/new" className="text-sm text-primary-600 hover:underline">+ New Ticket</Link>}>
        <TicketTable tickets={recent} basePath="/employee/tickets" />
      </Card>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
