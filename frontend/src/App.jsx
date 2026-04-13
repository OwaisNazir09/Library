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
import LedgerList from './pages/Ledger/LedgerList';
import LedgerDetail from './pages/Ledger/LedgerDetail';

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
          <Route path="ledger" element={<LedgerList />} />
          <Route path="ledger/:studentId" element={<LedgerDetail />} />
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
