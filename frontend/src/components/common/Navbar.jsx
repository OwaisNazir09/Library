import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Sun, Moon, Globe, Menu, LogOut,
  User as UserIcon, Settings as SettingsIcon
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchValue, setSearchValue] = React.useState('');
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(localStorage.getItem('theme') === 'dark');

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/app/books?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-[60px] bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200 transition-colors duration-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={15} />
          <input
            type="text"
            placeholder="Search books or members..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-lg h-[34px] pl-9 pr-4 text-[13px] transition-all outline-none placeholder:text-slate-400 dark:bg-slate-800 dark:focus:bg-slate-900 dark:focus:border-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 border-r border-slate-100 pr-3 mr-1">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 text-slate-400 hover:text-slate-900 transition-all rounded-md hover:bg-slate-50"
            title="Toggle Theme"
          >
            {isDark ? <Moon size={16} className="text-amber-500" /> : <Sun size={16} />}
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-all rounded-md hover:bg-slate-50">
            <Globe size={16} />
          </button>
        </div>

        <button
          onClick={() => navigate('/app/notifications')}
          className="relative p-1.5 text-slate-400 hover:text-slate-900 transition-all rounded-md hover:bg-slate-50"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="relative ml-1.5 pl-3 border-l border-slate-100">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 group"
          >
            <div className="hidden lg:block text-right">
              <p className="text-[12px] font-bold text-slate-900 leading-none group-hover:text-[#044343] transition-colors dark:text-slate-200">{user?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 leading-none uppercase tracking-tighter dark:text-slate-500">
                {user?.tenantId?.name || 'Library Admin'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-bold text-[#044343] group-hover:bg-teal-100 transition-all dark:bg-teal-900/20 dark:border-teal-900/30 dark:text-teal-400">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 dark:bg-slate-900 dark:border-slate-800 dark:shadow-2xl"
                >
                  <div className="px-4 py-2 border-b border-slate-50 mb-1 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-[13px] font-bold text-slate-900 truncate mt-0.5 dark:text-slate-200">{user?.email}</p>
                  </div>
                  <button onClick={() => { navigate('/app/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    <UserIcon size={14} /> My Profile
                  </button>
                  <button onClick={() => { navigate('/app/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    <SettingsIcon size={14} /> Settings
                  </button>
                  <div className="h-px bg-slate-50 my-1.5 dark:bg-slate-800" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-all dark:hover:bg-rose-950/20"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
