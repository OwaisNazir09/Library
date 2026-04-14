import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, TrendingDown, TrendingUp, RefreshCcw, 
  Wallet, PieChart, Receipt, Layers, Users
} from 'lucide-react';

const FinanceHeader = ({ onAction }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'overview',     label: 'Overview',      icon: PieChart,   path: '/app/finance' },
    { id: 'transactions', label: 'Transactions',  icon: RefreshCcw, path: '/app/finance/transactions' },
    { id: 'accounts',     label: 'Accounts',      icon: Wallet,       path: '/app/finance/accounts' },
    { id: 'student-accounts', label: 'Ledgers', icon: Users,        path: '/app/finance/student-accounts' },
    { id: 'receipts',     label: 'Receipts',      icon: Receipt,      path: '/app/finance/receipts' },
    { id: 'reports',      label: 'Reports',       icon: Layers,       path: '/app/finance/reports' },
  ];

  const actions = [
    { id: 'journal',     label: 'Journal', icon: RefreshCcw,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'expense',     label: 'Expense',     icon: TrendingDown, color: 'text-rose-500',   bg: 'bg-rose-50' },
    { id: 'income',      label: 'Income',      icon: TrendingUp,   color: 'text-emerald-500',bg: 'bg-emerald-50' },
    { id: 'transfer',    label: 'Transfer',    icon: RefreshCcw,   color: 'text-sky-500',    bg: 'bg-sky-50' },
    { id: 'payment',     label: 'Payment',     icon: Users,        color: 'text-[#044343]',  bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-300">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Finance Management</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Professional library accounting & logs</p>
        </div>
        
        <div className="flex flex-wrap justify-center lg:justify-end gap-2 md:gap-3">
          {actions.map((act) => (
            <motion.button
              key={act.id}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => onAction(act.id)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:border-[#044343] hover:shadow-md transition-all group min-w-[100px] md:min-w-0"
            >
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center ${act.bg} group-hover:scale-110 transition-transform`}>
                <act.icon size={14} className={act.color} />
              </div>
              <span className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest">{act.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs - Mobile Scrollable */}
      <div className="w-full overflow-x-auto pb-1 no-scrollbar overflow-hidden">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-max md:w-fit min-w-full md:min-w-0">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.id === 'overview' && location.pathname === '/app/finance');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2.5 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-[#044343] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={14} className={isActive ? 'text-[#044343]' : ''} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinanceHeader;
