import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLayout from './components/common/AdminLayout';
import SuperAdminDashboard from './pages/Admin/AdminDashboard';
import TenantManagement from './pages/Admin/TenantManagement';
import GlobalUsers from './pages/Admin/UserManagementGlobal';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BookList from './pages/Books/BookList';
import RegistrationList from './pages/Users/RegistrationList';
import PackageList from './pages/Packages/PackageList';
import BorrowingHistory from './pages/Borrowings/BorrowingHistory';
import EventList from './pages/Events/EventList';
import NotificationList from './pages/Notifications/NotificationList';
import TableBooking from './pages/Tables/TableBooking';
import Settings from './pages/Settings/Settings';

import ProtectedRoute from './components/common/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="users" element={<GlobalUsers />} />
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
          <Route path="tables" element={<TableBooking />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
