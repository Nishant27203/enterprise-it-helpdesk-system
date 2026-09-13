import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatusChart, PriorityChart, GenericBarChart } from '../../components/dashboard/DashboardCharts';
import * as dashboardService from '../../services/dashboardService';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getChartStatus(),
      dashboardService.getChartPriority(),
      dashboardService.getChartCategory(),
      dashboardService.getChartDepartment(),
      dashboardService.getChartTechnician(),
    ]).then(([s, status, priority, category, department, technician]) => {
      setStats(s);
      setCharts({ status, priority, category, department, technician });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Manager Dashboard"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="IT Manager Dashboard">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total Tickets" value={stats.totalTickets} />
        <StatCard label="Open" value={stats.openTickets} />
        <StatCard label="In Progress" value={stats.inProgressTickets} color="text-amber-600" />
        <StatCard label="Escalated" value={stats.escalatedTickets} color="text-red-600" />
        <StatCard label="SLA Breached" value={stats.slaBreachedTickets} color="text-red-600" />
        <StatCard label="SLA Compliance" value={`${stats.slaCompliancePercent}%`} color="text-green-600" sub={`Avg resolution: ${stats.avgResolutionHours}h`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Tickets by Status"><StatusChart data={charts.status} /></Card>
        <Card title="Tickets by Priority"><PriorityChart data={charts.priority} /></Card>
        <Card title="Tickets by Category"><GenericBarChart data={charts.category} color="#10b981" /></Card>
        <Card title="Tickets by Department"><GenericBarChart data={charts.department} color="#8b5cf6" /></Card>
        <Card title="Tickets by Technician" className="lg:col-span-2"><GenericBarChart data={charts.technician} color="#f59e0b" /></Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
