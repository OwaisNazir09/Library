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
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  Coffee,
  X
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
      { name: 'Fee Ledger', icon: DollarSign, path: '/app/ledger' },
      { name: 'Fines & Fees', icon: DollarSign, path: '/app/fines' },
    ]
  },
  {
    label: 'SETTING & OTHERS',
    items: [
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
    <div className="w-72 bg-white h-full flex flex-col border-r border-slate-100">
      {/* Branding */}
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-[#044343] rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/20 group-hover:scale-110 transition-transform">
            <BookOpen className="text-white" size={22} />
          </div>
          <span className="text-2xl font-black text-black tracking-tighter">Bookary</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-black transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-7 py-4 custom-scrollbar">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#044343] text-white shadow-xl shadow-teal-900/20'
                      : 'text-slate-900 hover:text-[#044343] hover:bg-slate-50'}
                  `}
                >
                  <item.icon size={20} className={`
                    transition-transform duration-300 group-hover:scale-110
                    ${location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-[#044343]'}
                  `} />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
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
      <div className="p-6 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-slate-900 font-bold hover:text-rose-600 transition-colors group w-full px-4 py-3 rounded-2xl hover:bg-rose-50"
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span className="text-sm">Log Out System</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-72 bg-white h-screen flex-col border-r border-slate-100 sticky top-0 shrink-0">
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
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl"
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
