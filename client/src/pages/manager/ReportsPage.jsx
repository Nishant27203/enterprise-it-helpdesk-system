import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PriorityChart, GenericBarChart } from '../../components/dashboard/DashboardCharts';
import { getReports } from '../../services/dashboardService';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Reports"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Volume" value={data.totalTickets} />
        <StatCard label="SLA Compliance" value={`${data.slaCompliancePercent}%`} color="text-green-600" />
        <StatCard label="Avg Resolution" value={`${data.avgResolutionHours}h`} />
        <StatCard label="SLA Breached" value={data.slaBreachedTickets} color="text-red-600" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Tickets by Priority"><PriorityChart data={data.ticketsByPriority} /></Card>
        <Card title="Tickets by Category"><GenericBarChart data={data.ticketsByCategory} /></Card>
        <Card title="Technician Performance"><GenericBarChart data={data.technicianPerformance} color="#3b82f6" /></Card>
        <Card title="Department Volume"><GenericBarChart data={data.departmentVolume} color="#8b5cf6" /></Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
