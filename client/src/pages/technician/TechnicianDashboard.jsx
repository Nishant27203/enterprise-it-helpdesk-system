import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTickets } from '../../services/ticketService';

const TechnicianDashboard = () => {
  const [stats, setStats] = useState({});
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets({ limit: 100 }).then((res) => {
      const all = res.data || [];
      setStats({
        assigned: all.filter((t) => t.assignedToId).length,
        unassigned: all.filter((t) => t.status === 'OPEN' && !t.assignedToId).length,
        critical: all.filter((t) => t.priority === 'CRITICAL' && !['CLOSED', 'RESOLVED'].includes(t.status)).length,
        high: all.filter((t) => t.priority === 'HIGH' && !['CLOSED', 'RESOLVED'].includes(t.status)).length,
        atRisk: all.filter((t) => t.slaStatus === 'AT_RISK').length,
        breached: all.filter((t) => t.slaStatus === 'BREACHED').length,
      });
      setTickets(all.filter((t) => !['CLOSED'].includes(t.status)).slice(0, 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Technician Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Technician Dashboard">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Assigned" value={stats.assigned} />
        <StatCard label="Unassigned" value={stats.unassigned} />
        <StatCard label="Critical" value={stats.critical} color="text-red-600" />
        <StatCard label="High Priority" value={stats.high} color="text-orange-600" />
        <StatCard label="SLA At Risk" value={stats.atRisk} color="text-amber-600" />
        <StatCard label="SLA Breached" value={stats.breached} color="text-red-600" />
      </div>
      <Card title="Active Tickets">
        <TicketTable tickets={tickets} basePath="/technician/tickets" />
      </Card>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
