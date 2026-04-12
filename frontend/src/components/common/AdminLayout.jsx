import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Library,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: BarChart2, path: '/admin/dashboard' },
    { name: 'Libraries', icon: Library, path: '/admin/tenants' },
    { name: 'Users (Global)', icon: Users, path: '/admin/users' },
    { name: 'Analytics', icon: ShieldCheck, path: '/admin/analytics' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const sidebarContent = (
    <div className="w-80 bg-white h-full flex flex-col border-r border-slate-100 shadow-xl shadow-teal-900/5">
      <div className="p-10 pb-6 flex-1">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#044343] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Admin<span className="text-teal-600">Core</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Authority</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-3xl transition-all group ${isActive
                  ? 'bg-[#044343] text-white shadow-xl shadow-teal-900/10'
                  : 'text-slate-400 hover:text-[#044343] hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                <span className="text-sm font-bold">{item.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-10 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-slate-400 font-bold hover:text-rose-500 transition-colors group w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-rose-50 flex items-center justify-center transition-colors">
            <LogOut size={20} />
          </div>
          <span className="text-sm">Logout Platform</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFB] font-sans">
      {/* Mobile Toggle */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 lg:hidden flex items-center px-6 z-30 shadow-sm shadow-slate-200/20">
        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 p-2 -ml-2">
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-lg font-black text-slate-900 tracking-tight">Admin<span className="text-teal-600">Core</span></h1>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 fixed h-full z-20">
        {sidebarContent}
      </aside>

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
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-80 p-6 md:p-12 mt-16 lg:mt-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
