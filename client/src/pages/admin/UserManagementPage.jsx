import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { getUsers, createUser, updateUser } from '../../services/userService';
import { getDepartments } from '../../services/categoryService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const toast = useToast();

  const load = () => {
    getUsers().then((res) => { setUsers(res.data); setLoading(false); });
    getDepartments().then(setDepartments);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (modal === 'create') await createUser(form);
      else await updateUser(form.id, form);
      toast.success('User saved');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed');
    }
  };

  if (loading) return <DashboardLayout title="User Management"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="User Management">
      <div className="mb-4 flex justify-end">
        <button onClick={() => { setForm({}); setModal('create'); }} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">+ Add User</button>
      </div>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Dept</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">{u.role?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">{u.department?.name || '—'}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3"><button onClick={() => { setForm(u); setModal('edit'); }} className="text-sm text-primary-600 hover:underline">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Create User' : 'Edit User'}>
        <div className="space-y-3">
          <input placeholder="First Name" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-lg border p-2 text-sm" />
          <input placeholder="Last Name" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-lg border p-2 text-sm" />
          {modal === 'create' && <input placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border p-2 text-sm" />}
          <input placeholder="Password" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border p-2 text-sm" />
          <select value={form.role || 'EMPLOYEE'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border p-2 text-sm">
            {['EMPLOYEE', 'IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={form.departmentId || ''} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="w-full rounded-lg border p-2 text-sm">
            <option value="">Department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {modal === 'edit' && (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          )}
          <button onClick={handleSave} className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white">Save</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagementPage;
