import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { createTicket } from '../../services/ticketService';
import { getCategories } from '../../services/categoryService';

const CreateTicketPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', subcategoryId: '', priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { getCategories().then(setCategories); }, []);

  const selectedCat = categories.find((c) => c.id === form.categoryId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ticket = await createTicket(form);
      toast.success(`Ticket ${ticket.ticketNumber} created`);
      navigate(`/employee/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Create Ticket">
      <Card title="New Support Request">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Brief summary of the issue" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Describe the issue in detail..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Subcategory</label>
              <select required value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Select subcategory</option>
                {selectedCat?.subcategories?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default CreateTicketPage;
