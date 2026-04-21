import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, TrendingDown, TrendingUp, RefreshCcw, 
  Wallet, PieChart, Receipt, Layers, Users
} from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

const FinanceHeader = ({ onAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpired } = useSubscription();

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
  ];

  return (
    <div className="space-y-5 mb-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Finance Management</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm">Professional library accounting & logs</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {actions.map((act) => (
            <button
              key={act.id}
              onClick={() => !isExpired && onAction(act.id)}
              disabled={isExpired}
              title={isExpired ? 'Subscription Expired' : ''}
              className={`btn btn-sm btn-secondary font-semibold ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <act.icon size={14} className={act.color} />
              <span className="text-[11px] uppercase tracking-wider">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-lg w-max md:w-fit">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.id === 'overview' && location.pathname === '/app/finance');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-[#044343] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={13} />
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
