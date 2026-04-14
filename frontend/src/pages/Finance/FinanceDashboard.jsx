import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, AlertCircle, 
  IndianRupee, Users, ArrowRight, PlusCircle, Receipt
} from 'lucide-react';
import { useGetFinanceStatsQuery, useGetTransactionsQuery } from '../../store/api/financeApi';
import { format } from 'date-fns';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const TYPE_STYLE = {
  income:      { label: 'Income',      cls: 'bg-emerald-100 text-emerald-700' },
  expense:     { label: 'Expense',     cls: 'bg-rose-100 text-rose-700' },
  fine:        { label: 'Fine',        cls: 'bg-amber-100 text-amber-700' },
  credit_note: { label: 'Credit Note', cls: 'bg-sky-100 text-sky-700' },
  debit_note:  { label: 'Debit Note',  cls: 'bg-purple-100 text-purple-700' },
  refund:      { label: 'Refund',      cls: 'bg-indigo-100 text-indigo-700' },
  adjustment:  { label: 'Adjustment',  cls: 'bg-slate-100 text-slate-700' },
};

const StatCard = ({ label, value, icon: Icon, color, bg, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex items-start gap-5"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon size={24} className={color} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black tracking-tight mt-1 ${color}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-400 font-bold mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } = useGetFinanceStatsQuery();
  const { data: transactionsData, isLoading: txLoading } = useGetTransactionsQuery({ limit: 8, sort: '-date' });
  const stats = statsData?.data;
  const transactions = transactionsData?.data || [];
  const loading = statsLoading || txLoading;

  const netColor = (stats?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600';

  const statCards = [
    { label: 'Total Income',    value: fmt(stats?.totalIncome),    icon: TrendingUp,   color: 'text-emerald-600', bg: 'bg-emerald-50',  delay: 0 },
    { label: 'Total Expenses',  value: fmt(stats?.totalExpenses),  icon: TrendingDown, color: 'text-rose-500',    bg: 'bg-rose-50',     delay: 0.05 },
    { label: 'Net Profit',      value: fmt(stats?.netProfit),      icon: Wallet,       color: netColor,           bg: 'bg-violet-50',   delay: 0.1, subtitle: (stats?.netProfit || 0) >= 0 ? 'Library is profitable' : 'Review expenses' },
    { label: 'Pending Fees',    value: fmt(stats?.pendingFees),    icon: IndianRupee,  color: 'text-amber-500',   bg: 'bg-amber-50',    delay: 0.15, subtitle: `${stats?.dueCount || 0} students with dues` },
    { label: "Today's Collection", value: fmt(stats?.todayCollection), icon: Receipt,  color: 'text-sky-600',     bg: 'bg-sky-50',      delay: 0.2 },
    { label: 'Overdue Students',value: stats?.overdueCount || 0,   icon: AlertCircle,  color: 'text-rose-600',    bg: 'bg-rose-50',     delay: 0.25, subtitle: 'Need immediate attention' },
    { label: 'Fine Collected',  value: fmt(stats?.fineCollected),  icon: AlertCircle,  color: 'text-amber-600',   bg: 'bg-amber-50',    delay: 0.3 },
    { label: 'Students with Dues', value: stats?.dueCount || 0,    icon: Users,        color: 'text-indigo-600',  bg: 'bg-indigo-50',   delay: 0.35 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Professional accounting & finance management</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/finance/transactions/new-expense')}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#044343] transition-all shadow-sm"
          >
            <PlusCircle size={15} /> Add Expense
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/app/finance/accounts')}
            className="flex items-center gap-2 bg-[#044343] text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-[#033636] transition-all"
          >
            <Users size={15} /> Student Accounts
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Transactions</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Latest financial activity</p>
          </div>
          <button
            onClick={() => navigate('/app/finance/transactions')}
            className="flex items-center gap-1.5 text-[#044343] text-xs font-black uppercase tracking-widest hover:gap-2.5 transition-all"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {loading && transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-bold">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <IndianRupee size={28} />
              </div>
              <p className="text-slate-900 font-black">No Transactions Yet</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Transactions will appear here once recorded.</p>
            </div>
          ) : transactions.map((tx, i) => {
            const style = TYPE_STYLE[tx.type] || TYPE_STYLE.adjustment;
            return (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center px-8 py-4 hover:bg-slate-50/40 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{tx.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {tx.studentId?.fullName || 'Library'} · {format(new Date(tx.date), 'dd MMM yyyy')}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.cls}`}>
                  {style.label}
                </span>
                <span className={`text-base font-black min-w-[80px] text-right ${
                  tx.type === 'expense' ? 'text-rose-500' : 
                  tx.type === 'credit_note' ? 'text-sky-500' : 'text-emerald-600'
                }`}>
                  {tx.type === 'expense' ? '−' : '+'}{fmt(tx.amount)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Student Accounts', path: '/app/finance/accounts', icon: Users, color: 'text-[#044343]', bg: 'bg-teal-50' },
          { label: 'Transactions', path: '/app/finance/transactions', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Receipts', path: '/app/finance/receipts', icon: Receipt, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Reports', path: '/app/finance/reports', icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(({ label, path, icon: Icon, color, bg }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path)}
            className="bg-white border border-slate-100 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <span className="text-sm font-black text-slate-900">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FinanceDashboard;
