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
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const groups = [
    {
      label: 'MAIN MENU',
      items: [
        { name: 'Overview', icon: LayoutGrid, path: '/app/dashboard' },
        { name: 'Books', icon: BookOpen, path: '/app/books' },
        { name: 'Library Activities', icon: Library, path: '/app/events' },
        { name: 'Members', icon: Users, path: '/app/users' },
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        { name: 'Report & Analytics', icon: BarChart2, path: '/app/reports' },
        { name: 'Overdue Reminder', icon: Clock, path: '/app/borrowings' },
        { name: 'Tables', icon: Coffee, path: '/app/tables' },
        { name: 'Add Books', icon: PlusCircle, path: '/app/books/add' },
        { name: 'Fines & Fees', icon: DollarSign, path: '/app/fines' },
      ]
    },
    {
      label: 'SETTING & OTHERS',
      items: [
        { name: 'Setting', icon: Settings, path: '/app/settings' },
        { name: 'Help & Support', icon: HelpCircle, path: '/app/support' },
        { name: 'Log Out', icon: LogOut, path: '/login' },
      ]
    }
  ];

  const sidebarContent = (
    <div className="w-72 bg-white h-full flex flex-col border-r border-slate-100">
      {/* Logo */}
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#044343] rounded-lg flex items-center justify-center">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-2xl font-bold text-[#044343] tracking-tight">Bookary</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-8 py-4 custom-scrollbar">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-5 text-[10px] font-bold text-slate-400 tracking-[0.1em] mb-4">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    sidebar-link group
                    ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                  `}
                >
                  <item.icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm font-semibold">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src="https://i.pravatar.cc/150?u=james" alt="user" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#044343] truncate">James William</p>
            <p className="text-[10px] text-slate-400 truncate font-medium">william01@gmail.com</p>
          </div>
        </div>
      </div>
      <div className="p-8 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-slate-400 font-bold hover:text-rose-500 transition-colors group w-full px-2 py-3 rounded-2xl hover:bg-rose-50"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
            <LogOut size={20} />
          </div>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white h-screen flex-col border-r border-slate-100 sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
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
