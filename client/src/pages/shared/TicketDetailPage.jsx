import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import SlaIndicator from '../../components/tickets/SlaIndicator';
import TicketActivityTimeline from '../../components/tickets/TicketActivityTimeline';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isIT, isManager } from '../../utils/permissions';
import { formatDate } from '../../utils/formatters';
import * as ticketService from '../../services/ticketService';
import { getTechnicians } from '../../services/userService';

const TicketDetailPage = ({ basePath, title }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const [t, c, h] = await Promise.all([
        ticketService.getTicket(id),
        ticketService.getComments(id),
        ticketService.getHistory(id),
      ]);
      setTicket(t);
      setComments(c);
      setHistory(h);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (isManager(user?.role) || isIT(user?.role)) {
      getTechnicians().then(setTechnicians).catch(() => {});
    }
  }, [id]);

  const handleAction = async (fn, successMsg) => {
    try {
      await fn();
      toast.success(successMsg);
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Action failed');
    }
  };

  const submitComment = () =>
    handleAction(async () => {
      await ticketService.addComment(id, comment, isInternal);
      setComment('');
    }, 'Comment added');

  if (loading) return <DashboardLayout title={title}><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></DashboardLayout>;
  if (!ticket) return <DashboardLayout title={title}><p>Ticket not found</p></DashboardLayout>;

  return (
    <DashboardLayout title={title}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-primary-600 hover:underline">← Back</button>
        <span className="font-mono text-sm text-slate-500">{ticket.ticketNumber}</span>
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={ticket.title}>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div>Category: <span className="text-slate-700">{ticket.category?.name} / {ticket.subcategory?.name}</span></div>
              <div>Department: <span className="text-slate-700">{ticket.department?.name}</span></div>
              <div>Requester: <span className="text-slate-700">{ticket.requester?.firstName} {ticket.requester?.lastName}</span></div>
              <div>Assignee: <span className="text-slate-700">{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}</span></div>
            </div>
          </Card>

          {ticket.troubleshootingNotes && isIT(user?.role) && (
            <Card title="Troubleshooting Notes"><p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.troubleshootingNotes}</p></Card>
          )}
          {ticket.resolutionNotes && (
            <Card title="Resolution"><p className="text-sm text-slate-700">{ticket.resolutionNotes}</p>{ticket.rootCause && <p className="mt-2 text-xs text-slate-500">Root cause: {ticket.rootCause}</p>}</Card>
          )}

          <Card title="Comments">
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className={`rounded-lg p-3 ${c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{c.author?.firstName} {c.author?.lastName} {c.isInternal && '(Internal)'}</span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a comment..." className="w-full rounded-lg border border-slate-300 p-3 text-sm" />
              {isIT(user?.role) && (
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} /> Internal note
                </label>
              )}
              <button onClick={submitComment} disabled={!comment.trim()} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">Post Comment</button>
            </div>
          </Card>

          <Card title="Activity Timeline"><TicketActivityTimeline history={history} /></Card>
        </div>

        <div className="space-y-4">
          <SlaIndicator ticket={ticket} />
          <Card title="Actions">
            <div className="flex flex-col gap-2">
              {isIT(user?.role) && ticket.status === 'OPEN' && !ticket.assignedToId && (
                <button onClick={() => handleAction(() => ticketService.acceptTicket(id), 'Ticket accepted')} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">Accept Ticket</button>
              )}
              {isIT(user?.role) && ticket.status === 'ASSIGNED' && (
                <button onClick={() => handleAction(() => ticketService.changeStatus(id, 'IN_PROGRESS'), 'Status updated')} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white">Start Working</button>
              )}
              {isIT(user?.role) && ['IN_PROGRESS', 'PENDING_USER', 'ESCALATED'].includes(ticket.status) && ticket.status !== 'IN_PROGRESS' && (
                <button onClick={() => handleAction(() => ticketService.changeStatus(id, 'IN_PROGRESS'), 'Resumed work')} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white">Resume Work</button>
              )}
              {isIT(user?.role) && ticket.status === 'IN_PROGRESS' && (
                <>
                  <button onClick={() => handleAction(() => ticketService.changeStatus(id, 'PENDING_USER'), 'Awaiting user')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Pending User</button>
                  <button onClick={() => setModal('resolve')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">Resolve</button>
                  <button onClick={() => setModal('escalate')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Escalate</button>
                </>
              )}
              {isManager(user?.role) && (
                <button onClick={() => setModal('assign')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Assign / Reassign</button>
              )}
              {ticket.status === 'RESOLVED' && (
                <button onClick={() => handleAction(() => ticketService.closeTicket(id), 'Ticket closed')} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white">Close Ticket</button>
              )}
              {ticket.status === 'RESOLVED' && ticket.requesterId === user?.id && !ticket.satisfactionRating && (
                <button onClick={() => setModal('feedback')} className="rounded-lg border border-primary-300 px-4 py-2 text-sm text-primary-700">Submit Feedback</button>
              )}
            </div>
          </Card>
          <Card title="Details">
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Updated</dt><dd>{formatDate(ticket.updatedAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Escalation</dt><dd>{ticket.escalationLevel}</dd></div>
              {ticket.satisfactionRating && <div className="flex justify-between"><dt className="text-slate-500">Rating</dt><dd>{'★'.repeat(ticket.satisfactionRating)}</dd></div>}
            </dl>
          </Card>
        </div>
      </div>

      <Modal isOpen={modal === 'resolve'} onClose={() => setModal(null)} title="Resolve Ticket">
        <div className="space-y-3">
          <textarea placeholder="Resolution notes" value={form.resolutionNotes || ''} onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })} className="w-full rounded-lg border p-2 text-sm" rows={3} />
          <input placeholder="Root cause" value={form.rootCause || ''} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} className="w-full rounded-lg border p-2 text-sm" />
          <textarea placeholder="Troubleshooting notes" value={form.troubleshootingNotes || ''} onChange={(e) => setForm({ ...form, troubleshootingNotes: e.target.value })} className="w-full rounded-lg border p-2 text-sm" rows={3} />
          <button onClick={() => handleAction(() => ticketService.resolveTicket(id, form), 'Ticket resolved')} className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white">Resolve</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'escalate'} onClose={() => setModal(null)} title="Escalate Ticket">
        <div className="space-y-3">
          <select value={form.toLevel || 'L2'} onChange={(e) => setForm({ ...form, toLevel: e.target.value })} className="w-full rounded-lg border p-2 text-sm">
            <option value="L2">L2 - Infrastructure/Application</option>
            <option value="L3">L3 - Engineering/Network</option>
          </select>
          <select value={form.escalatedToId || ''} onChange={(e) => setForm({ ...form, escalatedToId: e.target.value })} className="w-full rounded-lg border p-2 text-sm">
            <option value="">Select technician (optional)</option>
            {technicians.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
          </select>
          <input placeholder="Reason" value={form.reason || ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full rounded-lg border p-2 text-sm" />
          <textarea placeholder="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border p-2 text-sm" rows={2} />
          <button onClick={() => handleAction(() => ticketService.escalateTicket(id, form), 'Ticket escalated')} className="w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white">Escalate</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'assign'} onClose={() => setModal(null)} title="Assign Ticket">
        <select value={form.assignedToId || ''} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full rounded-lg border p-2 text-sm">
          <option value="">Select technician</option>
          {technicians.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
        </select>
        <button onClick={() => handleAction(() => ticketService.assignTicket(id, form.assignedToId), 'Ticket assigned')} className="mt-3 w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white">Assign</button>
      </Modal>

      <Modal isOpen={modal === 'feedback'} onClose={() => setModal(null)} title="Submit Feedback">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setForm({ ...form, rating: r })} className={`rounded-lg px-3 py-1 text-sm ${form.rating === r ? 'bg-primary-600 text-white' : 'border'}`}>{r} ★</button>
            ))}
          </div>
          <textarea placeholder="Comment (optional)" value={form.comment || ''} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="w-full rounded-lg border p-2 text-sm" rows={2} />
          <button onClick={() => handleAction(() => ticketService.submitFeedback(id, form.rating, form.comment), 'Feedback submitted')} className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white">Submit</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default TicketDetailPage;
