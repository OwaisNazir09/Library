import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Library, Users, MessageSquare,
  CreditCard, BarChart2, Settings, LogOut, ShieldCheck,
  Menu, X, ChevronRight
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Libraries (Nodes)', icon: Library, path: '/admin/libraries' },
  { name: 'Users (Global)', icon: Users, path: '/admin/users' },
  { name: 'Interest Queries', icon: MessageSquare, path: '/admin/queries' },
  { name: 'Billing & Subscriptions', icon: CreditCard, path: '/admin/billing' },
  { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
  { name: 'Platform Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="w-64 bg-white h-full flex flex-col border-r border-slate-100 shadow-sm">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#044343] rounded-xl flex items-center justify-center shadow">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
              Admin<span className="text-teal-600">Core</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Platform Authority</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all group ${
                isActive
                  ? 'bg-[#044343] text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={16} />
            <span className="flex-1">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
        >
          <LogOut size={16} />
          Logout Platform
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-100 lg:hidden flex items-center px-4 z-30 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 -ml-2 rounded-lg hover:bg-slate-50">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 bg-[#044343] rounded-lg flex items-center justify-center">
            <ShieldCheck size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-black text-slate-900">Admin<span className="text-teal-600">Core</span></span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 fixed h-full z-20 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
