import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  BookOpen,
  Library,
  Users,
  BarChart2,
  Clock,
  PlusCircle,
  IndianRupeeIcon,
  Settings,
  HelpCircle,
  LogOut,
  Coffee,
  X,
  Receipt,
  Bell
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const groups = [
  {
    label: 'MAIN MENU',
    items: [
      { name: 'Overview', icon: LayoutGrid, path: '/app/dashboard' },
      { name: 'Books', icon: BookOpen, path: '/app/books' },
      { name: 'Book Circulation', icon: PlusCircle, path: '/app/borrowings' },
      { name: 'Library Activities', icon: Library, path: '/app/events' },
      { name: 'Attendance Logs', icon: Clock, path: '/app/attendance' },
      { name: 'Student Registrations', icon: Users, path: '/app/registrations' },
      { name: 'Membership Packages', icon: LayoutGrid, path: '/app/packages' },
      { name: 'Study Desks', icon: Coffee, path: '/app/tables' },
      { name: 'Digital Library', icon: BookOpen, path: '/app/digital-library' },
    ]
  },
  {
    label: 'REPORTS',
    items: [
      { name: 'Reports & Analytics', icon: BarChart2, path: '/app/reports' },
      { name: 'Overdue Reminder', icon: Clock, path: '/app/reminders' },
    ]
  },
  {
    label: 'FINANCE',
    items: [
      { name: 'Finance Dashboard', icon: LayoutGrid, path: '/app/finance' },
      { name: 'Chart of Accounts', icon: Library, path: '/app/finance/accounts' },
      { name: 'Student Ledgers', icon: Users, path: '/app/finance/student-accounts' },
      { name: 'Transactions', icon: IndianRupeeIcon, path: '/app/finance/transactions' },
      { name: 'Receipts', icon: Receipt, path: '/app/finance/receipts' },
      { name: 'Financial Reports', icon: BarChart2, path: '/app/finance/reports' },
    ]
  },
  {
    label: 'SETTING & OTHERS',
    items: [
      { name: 'Push Notifications', icon: Bell, path: '/app/notifications/send' },
      { name: 'Setting', icon: Settings, path: '/app/settings' },
      { name: 'Help & Support', icon: HelpCircle, path: '/app/support' },
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sidebarContent = (
    <div className="w-64 bg-slate-50 h-full flex flex-col border-r border-slate-200 transition-colors duration-200 dark:bg-slate-900 dark:border-slate-800">
      {/* Branding */}
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/appicon.png" alt="Welib" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight dark:text-slate-100">Welib</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-black transition-colors">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto space-y-6 py-4 custom-scrollbar">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-semibold text-slate-500 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#044343] text-white shadow-sm dark:bg-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}
                  `}
                >
                  <item.icon size={18} className={`
                    transition-colors duration-200
                    ${location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
                  `} />
                  <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session Profile
      <div className="p-4 mt-auto">
        <div className="bg-slate-50 p-4 rounded-[2rem] flex items-center gap-3 border border-slate-100 transition-all hover:bg-slate-100/50">
          <div className="w-11 h-11 rounded-2xl bg-[#044343] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-900/10">
            {user?.fullName?.charAt(0) || 'J'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-black truncate tracking-tight">{user?.fullName || 'James William'}</p>
            <p className="text-[10px] text-slate-600 truncate font-bold uppercase tracking-widest">{user?.email || 'william01@gmail.com'}</p>
          </div>
        </div>
      </div> */}

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-600 font-medium hover:text-rose-600 transition-colors group w-full px-3 py-2 rounded-lg hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/20"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span className="text-[13px]">Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-slate-50 h-screen flex-col border-r border-slate-200 sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
