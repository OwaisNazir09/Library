import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Library, Users, MessageSquare,
  CreditCard, BarChart2, Settings, LogOut, ShieldCheck,
  Menu, X, Bell, Search, Package, ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Libraries', icon: Library, path: '/admin/libraries' },
      { name: 'Global Users', icon: Users, path: '/admin/users' },
    ]
  },
  {
    label: 'Business',
    items: [
      { name: 'Interest Queries', icon: MessageSquare, path: '/admin/queries' },
      { name: 'Subscriptions', icon: CreditCard, path: '/admin/billing' },
      { name: 'Packages', icon: Package, path: '/admin/packages' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
      { name: 'Platform Settings', icon: Settings, path: '/admin/settings' },
    ]
  }
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const user = useSelector(state => state.auth?.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="w-64 bg-white h-full flex flex-col border-r border-slate-100">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#044343] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
              Welib<span className="text-teal-600"> Admin</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Super Admin</p>
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-3 mb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${isActive
                      ? 'bg-[#044343] text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon size={16} />
                  <span className="flex-1">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
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
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 h-16 flex items-center px-6 gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 -ml-2 rounded-xl hover:bg-slate-50 lg:hidden">
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search libraries, users..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-10 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#044343]/10 focus:bg-white transition-all"
            />
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-[#044343] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-teal-900/20">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-black text-slate-900 leading-none">{user?.fullName || 'Admin'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-screen-2xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
