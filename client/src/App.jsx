import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ROLES } from './utils/constants';
import LoginPage from './pages/auth/LoginPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyTicketsPage from './pages/employee/MyTicketsPage';
import CreateTicketPage from './pages/employee/CreateTicketPage';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AssignedTicketsPage from './pages/technician/AssignedTicketsPage';
import TicketQueuePage from './pages/technician/TicketQueuePage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ReportsPage from './pages/manager/ReportsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import SlaPolicyPage from './pages/admin/SlaPolicyPage';
import TicketDetailPage from './pages/shared/TicketDetailPage';
import KnowledgeBasePage from './pages/knowledge/KnowledgeBasePage';
import ArticleDetailPage from './pages/knowledge/ArticleDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/employee" element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.ADMIN]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/tickets" element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.ADMIN]}><MyTicketsPage /></ProtectedRoute>} />
            <Route path="/employee/tickets/new" element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.ADMIN]}><CreateTicketPage /></ProtectedRoute>} />
            <Route path="/employee/tickets/:id" element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.ADMIN]}><TicketDetailPage basePath="/employee/tickets" title="Ticket Details" /></ProtectedRoute>} />

            <Route path="/technician" element={<ProtectedRoute allowedRoles={[ROLES.IT_TECHNICIAN, ROLES.IT_MANAGER, ROLES.ADMIN]}><TechnicianDashboard /></ProtectedRoute>} />
            <Route path="/technician/assigned" element={<ProtectedRoute allowedRoles={[ROLES.IT_TECHNICIAN, ROLES.IT_MANAGER, ROLES.ADMIN]}><AssignedTicketsPage /></ProtectedRoute>} />
            <Route path="/technician/queue" element={<ProtectedRoute allowedRoles={[ROLES.IT_TECHNICIAN, ROLES.IT_MANAGER, ROLES.ADMIN]}><TicketQueuePage /></ProtectedRoute>} />
            <Route path="/technician/tickets/:id" element={<ProtectedRoute allowedRoles={[ROLES.IT_TECHNICIAN, ROLES.IT_MANAGER, ROLES.ADMIN]}><TicketDetailPage basePath="/technician/tickets" title="Ticket Details" /></ProtectedRoute>} />

            <Route path="/manager" element={<ProtectedRoute allowedRoles={[ROLES.IT_MANAGER, ROLES.ADMIN]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={[ROLES.IT_MANAGER, ROLES.ADMIN]}><ReportsPage /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CategoryManagementPage /></ProtectedRoute>} />
            <Route path="/admin/sla" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SlaPolicyPage /></ProtectedRoute>} />

            <Route path="/knowledge" element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.IT_TECHNICIAN, ROLES.IT_MANAGER, ROLES.ADMIN]}><KnowledgeBasePage /></ProtectedRoute>} />
            <Route path="/knowledge/:id" element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.IT_TECHNICIAN, ROLES.IT_MANAGER, ROLES.ADMIN]}><ArticleDetailPage /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
