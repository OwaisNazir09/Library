import React from 'react';
import { Search, Bell, Sun, Globe, UserPlus, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('dashboard')) return 'Overview';
    if (path.includes('/books')) return 'Books Inventory';
    if (path.includes('/events')) return 'Library Events';
    if (path.includes('/users')) return 'Members Management';
    if (path.includes('/tables')) return 'Table Bookings';
    if (path.includes('/reports')) return 'Reports & Analytics';
    if (path.includes('/borrowings')) return 'Borrowing History';
    if (path.includes('/fines')) return 'Fines & Fees';
    if (path.includes('/settings')) return 'System Settings';
    return 'Dashboard';
  };

  const isDashboard = location.pathname.endsWith('dashboard');

  return (
    <header className="h-14 md:h-16 bg-white px-4 md:px-5 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-[#044343] transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-xl mx-8 font-medium">
        <div className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search documents, books, or members..." 
            className="input-field pl-10 bg-slate-50 border-transparent focus:bg-white w-full max-w-md"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-2 border-r border-slate-100 pr-4 mr-2">
          <button className="p-2 text-slate-400 hover:text-[#044343] transition-colors">
            <Sun size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-[#044343] transition-colors">
             <Globe size={18} />
          </button>
        </div>
        
        <button className="relative p-2.5 text-slate-400 hover:text-[#044343] transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[10px] font-bold text-[#044343] ml-2">
          {user?.fullName?.charAt(0) || 'J'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
