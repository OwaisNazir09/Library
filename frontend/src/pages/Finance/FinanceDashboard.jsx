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

const StatCard = ({ label, value, icon: Icon, color, bg, subtitle }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
      <Icon size={18} className={color} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold tracking-tight mt-0.5 ${color} truncate`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{subtitle}</p>}
    </div>
  </div>
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
    { label: 'Net Profit', value: fmt(stats?.netProfit), icon: Wallet, color: netColor, bg: 'bg-violet-50', subtitle: (stats?.netProfit || 0) >= 0 ? 'Profitable' : 'Loss' },
    { label: 'Total Assets', value: fmt(stats?.totalAssets), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', subtitle: 'Current worth' },
    { label: 'Total Liabilities', value: fmt(stats?.totalLiabilities), icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', subtitle: 'Obligations' },
    { label: 'Liquid Assets', value: fmt(stats?.liquidAssets), icon: IndianRupee, color: 'text-sky-600', bg: 'bg-sky-50', subtitle: 'Cash + Bank' },
    { label: 'Total Equity', value: fmt(stats?.totalEquity), icon: Receipt, color: 'text-indigo-600', bg: 'bg-indigo-50', subtitle: "Owner's" },
    { label: 'Pending Fees', value: fmt(stats?.pendingFees), icon: Users, color: 'text-amber-500', bg: 'bg-amber-50', subtitle: 'Receivables' },
  ];

  return (
    <div className="space-y-5 pb-10">
      <FinanceHeader onAction={handleAction} />

      <UniversalTransactionModal
        initialType={modal.type || 'journal'}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Latest financial movements</p>
            </div>
            <button
              onClick={() => navigate('/app/finance/transactions')}
              className="btn btn-ghost btn-sm text-[11px] font-bold uppercase tracking-wider"
            >
              View All <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          <div className="divide-y divide-slate-50 flex-1 overflow-x-auto">
            {loading && transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">Loading activity...</div>
            ) : transactions.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <IndianRupee size={24} />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Activity Yet</p>
                <p className="text-slate-400 text-xs mt-1">Transactions will appear here once recorded.</p>
              </div>
            ) : (
              <div className="min-w-[600px] sm:min-w-0">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center px-5 py-3 hover:bg-slate-50/50 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                        <span className="text-emerald-600 font-bold truncate">{tx.debitAccountId?.name}</span>
                        <ArrowRight size={10} className="text-slate-300 shrink-0" />
                        <span className="text-rose-500 font-bold truncate">{tx.creditAccountId?.name}</span>
                        <span className="ml-1.5 opacity-60">· {format(new Date(tx.date), 'dd MMM yyyy')}</span>
                      </p>
                    </div>
                    <span className="badge badge-neutral lowercase">{tx.type}</span>
                    <span className="text-[13px] font-bold min-w-[90px] text-right text-slate-900">
                      {fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 uppercase tracking-widest text-[11px] text-slate-400">Quick Links</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Chart of Accounts', path: '/app/finance/accounts', icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Student Ledgers', path: '/app/finance/student-accounts', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Receipts & Vouchers', path: '/app/finance/receipts', icon: Receipt, color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'Financial Reports', path: '/app/finance/reports', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map(({ label, path, icon: Icon, color, bg }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all text-left group"
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${bg}`}>
                    <Icon size={14} className={color} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tip */}
          <div className="bg-[#044343] rounded-lg p-5 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1.5">Accounting Tip</h4>
              <p className="text-[13px] font-medium leading-relaxed opacity-90">
                Maintain a clean General Ledger by recording all cash movements through the Entry tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
