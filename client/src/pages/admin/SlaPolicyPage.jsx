import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { getSlaPolicies, updateSlaPolicy } from '../../services/categoryService';

const SlaPolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const toast = useToast();

  useEffect(() => { getSlaPolicies().then(setPolicies); }, []);

  const handleUpdate = async (id, field, value) => {
    try {
      await updateSlaPolicy(id, { [field]: parseInt(value) });
      toast.success('SLA policy updated');
      getSlaPolicies().then(setPolicies);
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <DashboardLayout title="SLA Policies">
      <Card title="Configure SLA Response & Resolution Times">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Response (min)</th><th className="px-4 py-3">Resolution (min)</th></tr>
          </thead>
          <tbody className="divide-y">
            {policies.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.priority}</td>
                <td className="px-4 py-3">
                  <input type="number" defaultValue={p.responseTimeMinutes} onBlur={(e) => handleUpdate(p.id, 'responseTimeMinutes', e.target.value)} className="w-24 rounded border px-2 py-1 text-sm" />
                </td>
                <td className="px-4 py-3">
                  <input type="number" defaultValue={p.resolutionTimeMinutes} onBlur={(e) => handleUpdate(p.id, 'resolutionTimeMinutes', e.target.value)} className="w-24 rounded border px-2 py-1 text-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
};

export default SlaPolicyPage;
