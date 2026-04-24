import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import QueryPage from './pages/Query/QueryPage';
import AdminLayout from './components/common/AdminLayout';
import SuperAdminDashboard from './pages/Admin/AdminDashboard';
import TenantManagement from './pages/Admin/TenantManagement';
import CreateLibrary from './pages/Admin/CreateLibrary';
import GlobalUsers from './pages/Admin/GlobalUsers';
import InterestQueries from './pages/Admin/InterestQueries';
import BillingSubscriptions from './pages/Admin/BillingSubscriptions';
import Analytics from './pages/Admin/Analytics';
import PlatformSettings from './pages/Admin/PlatformSettings';
import Packages from './pages/Admin/Packages';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BookList from './pages/Books/BookList';
import RegistrationList from './pages/Users/RegistrationList';
import PackageList from './pages/Packages/PackageList';
import BorrowingHistory from './pages/Borrowings/BorrowingHistory';
import EventList from './pages/Events/EventList';
import AttendanceList from './pages/Attendance/AttendanceList';
import NotificationList from './pages/Notifications/NotificationList';
import SendNotification from './pages/Notifications/SendNotification';
import Tables from './pages/Tables/Tables';
import Settings from './pages/Settings/Settings';
import Reports from './pages/Reports/Reports';
import Reminders from './pages/Reminders/Reminders';
import Fines from './pages/Fines/Fines';
import DigitalLibrary from './pages/DigitalLibrary/DigitalLibrary';
import ResourceDetail from './pages/DigitalLibrary/ResourceDetail';
import LandingPage from './pages/Landing/LandingPage';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import StudentAccounts from './pages/Finance/StudentAccounts';
import StudentLedger from './pages/Finance/StudentLedger';
import Transactions from './pages/Finance/Transactions';
import Receipts from './pages/Finance/Receipts';
import FinanceReports from './pages/Finance/FinanceReports';
import AccountManagement from './pages/Finance/AccountManagement';
import ExpiringMemberships from './pages/Reports/ExpiringMemberships';
import BlogApproval from './pages/Blogs/BlogApproval';
import QuotesAdmin from './pages/Quotes/QuotesAdmin';

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
          <Route path="libraries" element={<TenantManagement />} />
          <Route path="libraries/create" element={<CreateLibrary />} />
          <Route path="tenants" element={<Navigate to="/admin/libraries" replace />} />
          <Route path="users" element={<GlobalUsers />} />
          <Route path="queries" element={<InterestQueries />} />
          <Route path="packages" element={<Packages />} />
          <Route path="billing" element={<BillingSubscriptions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="quotes" element={<QuotesAdmin />} />
          <Route path="settings" element={<PlatformSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['librarian', 'member']} />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<BookList />} />
          <Route path="registrations" element={<RegistrationList />} />
          <Route path="packages" element={<PackageList />} />
          <Route path="borrowings" element={<BorrowingHistory />} />
          <Route path="events" element={<EventList />} />
          <Route path="attendance" element={<AttendanceList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/expiring-memberships" element={<ExpiringMemberships />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="fines" element={<Fines />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/student-accounts" element={<StudentAccounts />} />
          <Route path="finance/student-accounts/:studentId" element={<StudentLedger />} />
          <Route path="finance/transactions" element={<Transactions />} />
          <Route path="finance/accounts" element={<AccountManagement />} />
          <Route path="finance/expenses" element={<Transactions type="expense" />} />
          <Route path="finance/income" element={<Transactions type="income" />} />
          <Route path="finance/receipts" element={<Receipts />} />
          <Route path="finance/reports" element={<FinanceReports />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="notifications/send" element={<SendNotification />} />
          <Route path="tables" element={<Tables />} />
          <Route path="digital-library" element={<DigitalLibrary />} />
          <Route path="digital-library/:resourceId" element={<ResourceDetail />} />
          <Route path="blogs" element={<BlogApproval />} />
          <Route path="quotes" element={<QuotesAdmin />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
