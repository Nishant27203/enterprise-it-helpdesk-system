import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, Ticket, Plus, Users, BookOpen, Settings, BarChart3, List,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isIT, isManager, isAdmin } from '../../utils/permissions';

const linkClass = ({ isActive }) =>
  clsx(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
    isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  );

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">IT</div>
        <span className="text-lg font-semibold text-white">Help Desk</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {role === 'EMPLOYEE' && (
          <>
            <NavLink to="/employee" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
            <NavLink to="/employee/tickets" className={linkClass}><Ticket className="h-4 w-4" /> My Tickets</NavLink>
            <NavLink to="/employee/tickets/new" className={linkClass}><Plus className="h-4 w-4" /> New Ticket</NavLink>
          </>
        )}
        {role === 'IT_TECHNICIAN' && (
          <>
            <NavLink to="/technician" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
            <NavLink to="/technician/assigned" className={linkClass}><List className="h-4 w-4" /> Assigned</NavLink>
            <NavLink to="/technician/queue" className={linkClass}><Ticket className="h-4 w-4" /> Queue</NavLink>
          </>
        )}
        {isManager(role) && (
          <>
            <NavLink to="/manager" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
            <NavLink to="/manager/reports" className={linkClass}><BarChart3 className="h-4 w-4" /> Reports</NavLink>
          </>
        )}
        {isAdmin(role) && (
          <>
            <NavLink to="/admin" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
            <NavLink to="/admin/users" className={linkClass}><Users className="h-4 w-4" /> Users</NavLink>
            <NavLink to="/admin/categories" className={linkClass}><Settings className="h-4 w-4" /> Categories</NavLink>
            <NavLink to="/admin/sla" className={linkClass}><Settings className="h-4 w-4" /> SLA Policies</NavLink>
          </>
        )}
        <div className="my-3 border-t border-slate-800" />
        <NavLink to="/knowledge" className={linkClass}><BookOpen className="h-4 w-4" /> Knowledge Base</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
