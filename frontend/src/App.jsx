import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import QueryPage from './pages/Query/QueryPage';
import AdminLayout from './components/common/AdminLayout';
import SuperAdminDashboard from './pages/Admin/AdminDashboard';
import TenantManagement from './pages/Admin/TenantManagement';
import GlobalUsers from './pages/Admin/UserManagementGlobal';
import QueriesDashboard from './pages/Admin/QueriesDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BookList from './pages/Books/BookList';
import RegistrationList from './pages/Users/RegistrationList';
import PackageList from './pages/Packages/PackageList';
import BorrowingHistory from './pages/Borrowings/BorrowingHistory';
import EventList from './pages/Events/EventList';
import NotificationList from './pages/Notifications/NotificationList';
import Tables from './pages/Tables/Tables';
import Settings from './pages/Settings/Settings';
import Reports from './pages/Reports/Reports';
import Reminders from './pages/Reminders/Reminders';
import Fines from './pages/Fines/Fines';
import DigitalLibrary from './pages/DigitalLibrary/DigitalLibrary';
import LandingPage from './pages/Landing/LandingPage';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import StudentAccounts from './pages/Finance/StudentAccounts';
import StudentLedger from './pages/Finance/StudentLedger';
import Transactions from './pages/Finance/Transactions';
import Receipts from './pages/Finance/Receipts';
import FinanceReports from './pages/Finance/FinanceReports';

import ProtectedRoute from './components/common/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/query" element={<QueryPage />} />
      <Route path="/register" element={<Navigate to="/query" replace />} />


      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="users" element={<GlobalUsers />} />
          <Route path="queries" element={<QueriesDashboard />} />
          <Route path="analytics" element={<SuperAdminDashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['librarian', 'member', 'admin']} />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<BookList />} />
          <Route path="registrations" element={<RegistrationList />} />
          <Route path="packages" element={<PackageList />} />
          <Route path="borrowings" element={<BorrowingHistory />} />
          <Route path="events" element={<EventList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="fines" element={<Fines />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/accounts" element={<StudentAccounts />} />
          <Route path="finance/accounts/:studentId" element={<StudentLedger />} />
          <Route path="finance/transactions" element={<Transactions />} />
          <Route path="finance/receipts" element={<Receipts />} />
          <Route path="finance/reports" element={<FinanceReports />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="tables" element={<Tables />} />
          <Route path="digital-library" element={<DigitalLibrary />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
