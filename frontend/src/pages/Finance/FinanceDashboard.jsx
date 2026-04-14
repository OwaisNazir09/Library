import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, AlertCircle, 
  IndianRupee, Users, ArrowRight, PlusCircle, Receipt, RefreshCcw, Home
} from 'lucide-react';
import { useGetFinanceStatsQuery, useGetTransactionsQuery } from '../../store/api/financeApi';
import { format } from 'date-fns';
import FinanceHeader from './FinanceHeader';
import UniversalTransactionModal from './UniversalTransactionModal';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const TYPE_STYLE = {
  income: { label: 'Income', cls: 'bg-emerald-100 text-emerald-700' },
  expense: { label: 'Expense', cls: 'bg-rose-100 text-rose-700' },
  fine: { label: 'Fine', cls: 'bg-amber-100 text-amber-700' },
  credit_note: { label: 'Credit Note', cls: 'bg-sky-100 text-sky-700' },
  debit_note: { label: 'Debit Note', cls: 'bg-purple-100 text-purple-700' },
  refund: { label: 'Refund', cls: 'bg-indigo-100 text-indigo-700' },
  adjustment: { label: 'Adjustment', cls: 'bg-slate-100 text-slate-700' },
};

const StatCard = ({ label, value, icon: Icon, color, bg, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 flex items-start gap-4 md:gap-5"
  >
    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon size={20} className={color} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-xl md:text-2xl font-black tracking-tight mt-0.5 md:mt-1 ${color} truncate`}>{value}</p>
      {subtitle && <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-1 truncate">{subtitle}</p>}
    </div>
  </motion.div>
);

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [modal, setModal] = React.useState({ type: null, isOpen: false });

  const { data: statsData, isLoading: statsLoading } = useGetFinanceStatsQuery();
  const { data: transactionsData, isLoading: txLoading } = useGetTransactionsQuery({ limit: 8, sort: '-date' });
  const stats = statsData?.data;
  const transactions = transactionsData?.data || [];
  const loading = statsLoading || txLoading;

  const handleAction = (type) => setModal({ type, isOpen: true });

  const netColor = (stats?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600';

  const statCards = [
    { label: 'Net Profit', value: fmt(stats?.netProfit), icon: Wallet, color: netColor, bg: 'bg-violet-50', delay: 0, subtitle: (stats?.netProfit || 0) >= 0 ? 'Profitable' : 'Loss' },
    { label: 'Total Assets', value: fmt(stats?.totalAssets), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', delay: 0.05, subtitle: 'Current worth' },
    { label: 'Total Liabilities', value: fmt(stats?.totalLiabilities), icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', delay: 0.1, subtitle: 'Obligations' },
    { label: 'Liquid Assets', value: fmt(stats?.liquidAssets), icon: IndianRupee, color: 'text-sky-600', bg: 'bg-sky-50', delay: 0.15, subtitle: 'Cash + Bank' },
    { label: 'Total Equity', value: fmt(stats?.totalEquity), icon: Receipt, color: 'text-indigo-600', bg: 'bg-indigo-50', delay: 0.2, subtitle: "Owner's" },
    { label: 'Pending Fees', value: fmt(stats?.pendingFees), icon: Users, color: 'text-amber-500', bg: 'bg-amber-50', delay: 0.25, subtitle: 'Receivables' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <FinanceHeader onAction={handleAction} />

      <UniversalTransactionModal
        initialType={modal.type || 'journal'}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-5">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 gap-4">
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-0.5">Latest financial movements</p>
            </div>
            <button
              onClick={() => navigate('/app/finance/transactions')}
              className="flex items-center gap-1.5 text-[#044343] text-xs font-black uppercase tracking-widest hover:gap-2.5 transition-all w-fit"
            >
              General Ledger <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-50 flex-1 overflow-x-auto">
            {loading && transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-bold">Loading activity...</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <IndianRupee size={28} />
                </div>
                <p className="text-slate-900 font-black">No Activity Yet</p>
                <p className="text-slate-400 text-sm font-medium mt-1">Activity will appear here once accounts are created.</p>
              </div>
            ) : (
              <div className="min-w-[600px] sm:min-w-0">
                {transactions.map((tx, i) => (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center px-6 md:px-8 py-4 hover:bg-slate-50/40 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{tx.description}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2">
                        <span className="text-emerald-600 font-black truncate max-w-[80px] md:max-w-none">{tx.debitAccountId?.name}</span>
                        <ArrowRight size={10} className="text-slate-300 shrink-0" />
                        <span className="text-rose-500 font-black truncate max-w-[80px] md:max-w-none">{tx.creditAccountId?.name}</span>
                        <span className="ml-2 shrink-0">· {format(new Date(tx.date), 'dd MMM yyyy')}</span>
                      </p>
                    </div>
                    <span className={`px-2 md:px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 shrink-0`}>
                      {tx.type}
                    </span>
                    <span className={`text-sm md:text-base font-black min-w-[80px] md:min-w-[100px] text-right text-slate-900`}>
                      {fmt(tx.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight mb-5 md:mb-6">Accounting Links</h3>
            <div className="space-y-3">
              {[
                { label: 'Chart of Accounts', path: '/app/finance/accounts', icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Student Accounts', path: '/app/finance/student-accounts', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Receipts & Vouchers', path: '/app/finance/receipts', icon: Receipt, color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'Financial Reports', path: '/app/finance/reports', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map(({ label, path, icon: Icon, color, bg }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-4 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-50 hover:border-[#044343] hover:shadow-sm transition-all text-left group"
                >
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${color}`} />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-slate-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info / Tip */}
          <div className="bg-[#044343] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-teal-900/20">
            <div className="relative z-10">
              <h4 className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Accounting Tip</h4>
              <p className="text-sm font-medium leading-relaxed">
                Maintain a clean General Ledger by recording all cash movements through the "New Financial Entry" tool.
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <IndianRupee size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
