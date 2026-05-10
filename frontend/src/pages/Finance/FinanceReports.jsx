import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, PieChart, TrendingUp, TrendingDown, Landmark,
  FileText, Download, IndianRupee, Layers, ChevronRight,
  Activity, Wallet, Calendar, Filter, RefreshCcw, ArrowRight
} from 'lucide-react';
import {
  useGetTrialBalanceQuery, useGetProfitAndLossQuery, useGetBalanceSheetQuery
} from '../../store/api/financeApi';
import { format } from 'date-fns';
import { useSubscription } from '../../hooks/useSubscription';
import LockedFeature from '../../components/common/LockedFeature';

const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('pl');
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const { hasFeature } = useSubscription();

  if (!hasFeature('finance')) {
    return (
      <LockedFeature
        featureName="Financial Reports"
        description="Detailed Profit & Loss, Balance Sheets, and Trial Balance reports are available on premium plans. Upgrade to gain full financial oversight."
        icon={BarChart3}
      />
    );
  }

  const { data: tbData, isLoading: tbLoading } = useGetTrialBalanceQuery();
  const { data: plData, isLoading: plLoading } = useGetProfitAndLossQuery(filters);
  const { data: bsData, isLoading: bsLoading } = useGetBalanceSheetQuery();

  const trialBalance = tbData?.data?.accounts || [];
  const tbStats = tbData?.data || { totalDebit: 0, totalCredit: 0, isBalanced: true };
  const pl = plData?.data || { income: [], expenses: [], totalIncome: 0, totalExpenses: 0, netProfit: 0 };
  const bs = bsData?.data || { assets: [], liabilities: [], equity: [], totalAssets: 0, totalLiabilities: 0, totalEquity: 0 };

  const tabs = [
    { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'bs', label: 'Balance Sheet', icon: Landmark },
  ];

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-widest">System Ledger • Statements</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg h-[34px] px-2 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" className="bg-transparent border-none text-[12px] font-bold outline-none focus:ring-0 p-0" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
            <span className="text-slate-300 text-[10px] font-bold">TO</span>
            <input type="date" className="bg-transparent border-none text-[12px] font-bold outline-none focus:ring-0 p-0" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <button onClick={() => setFilters({ startDate: '', endDate: '' })} className="btn btn-secondary btn-md w-[34px] p-0 shadow-sm"><RefreshCcw size={14} /></button>
          <button className="btn btn-primary btn-md shadow-sm"><Download size={14} /> <span className="hidden sm:inline ml-1.5 font-bold uppercase tracking-wider text-[11px]">Export PDF</span></button>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-max no-print border border-slate-200 shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-[#044343] shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'pl' && <PLReport pl={pl} fmt={fmt} />}
          {activeTab === 'bs' && <BSReport bs={bs} fmt={fmt} />}
          {activeTab === 'tb' && <TBReport tb={trialBalance} stats={tbStats} fmt={fmt} loading={tbLoading} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PLReport = ({ pl, fmt }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-0 overflow-hidden shadow-sm border-slate-100">
        <div className="px-5 py-4 border-b border-emerald-50 bg-emerald-50/20 flex items-center justify-between">
          <h2 className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-2"><TrendingUp size={14} /> Operating Income</h2>
          <span className="text-xl font-black text-emerald-600">{fmt(pl.totalIncome)}</span>
        </div>
        <div className="p-5 space-y-5">
          {pl.income.map((acc, i) => (
            <div key={i} className="flex justify-between items-center group">
              <div><p className="text-[14px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{acc.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{acc.subType}</p></div>
              <span className="text-[14px] font-black text-slate-900">{fmt(acc.balance)}</span>
            </div>
          ))}
          {!pl.income.length && <p className="text-xs text-slate-300 font-bold uppercase text-center py-8">No revenue recorded</p>}
        </div>
      </div>
      <div className="card p-0 overflow-hidden shadow-sm border-slate-100">
        <div className="px-5 py-4 border-b border-rose-50 bg-rose-50/20 flex items-center justify-between">
          <h2 className="text-[11px] font-black text-rose-700 uppercase tracking-[0.2em] flex items-center gap-2"><TrendingDown size={14} /> Total Expenses</h2>
          <span className="text-xl font-black text-rose-500">{fmt(pl.totalExpenses)}</span>
        </div>
        <div className="p-5 space-y-5">
          {pl.expenses.map((acc, i) => (
            <div key={i} className="flex justify-between items-center group">
              <div><p className="text-[14px] font-bold text-slate-900 group-hover:text-rose-500 transition-colors">{acc.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{acc.subType}</p></div>
              <span className="text-[14px] font-black text-slate-900">{fmt(acc.balance)}</span>
            </div>
          ))}
          {!pl.expenses.length && <p className="text-xs text-slate-300 font-bold uppercase text-center py-8">No expenses found</p>}
        </div>
      </div>
    </div>
    <div className={`p-6 rounded-2xl flex items-center justify-between shadow-sm border-2 bg-white ${pl.netProfit >= 0 ? 'border-teal-500/30 shadow-teal-900/5' : 'border-rose-500/30 shadow-rose-900/5'}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity size={14} className={pl.netProfit >= 0 ? 'text-teal-600' : 'text-rose-600'} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Current {pl.netProfit >= 0 ? 'Profitability' : 'Loss Margin'}
          </p>
        </div>
        <h3 className={`text-3xl font-black ${pl.netProfit >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>{fmt(Math.abs(pl.netProfit || 0))}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${pl.netProfit >= 0 ? 'bg-teal-50 border-teal-100' : 'bg-rose-50 border-rose-100'}`}>
        {pl.netProfit >= 0 ? <TrendingUp size={28} className="text-teal-600" /> : <TrendingDown size={28} className="text-rose-600" />}
      </div>
    </div>
  </div>
);

const BSReport = ({ bs, fmt }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-0 overflow-hidden border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2"><Landmark size={14} /> Assets Overview</h2>
          <span className="text-xl font-black text-slate-900">{fmt(bs.totalAssets)}</span>
        </div>
        <div className="p-5 space-y-5">
          {bs.assets.map((acc, i) => (
            <div key={i} className="flex justify-between items-center group">
              <span className="text-[14px] font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{acc.name}</span>
              <span className="text-[14px] font-black text-slate-900">{fmt(acc.balance)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="card p-0 overflow-hidden flex-1 border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Liabilities</h2>
            <span className="text-sm font-black text-slate-900">{fmt(bs.totalLiabilities)}</span>
          </div>
          <div className="p-5 space-y-4">
            {bs.liabilities.map((acc, i) => <div key={i} className="flex justify-between items-center text-[14px] font-bold text-slate-900"><span>{acc.name}</span><span className="font-black">{fmt(acc.balance)}</span></div>)}
          </div>
        </div>
        <div className="card p-0 overflow-hidden flex-1 border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Equity</h2>
            <span className="text-sm font-black text-slate-900">{fmt(bs.totalEquity)}</span>
          </div>
          <div className="p-5 space-y-4">
            {bs.equity.map((acc, i) => <div key={i} className="flex justify-between items-center text-[14px] font-bold text-slate-900"><span>{acc.name}</span><span className="font-black">{fmt(acc.balance)}</span></div>)}
          </div>
        </div>
      </div>
    </div>
    <div className={`p-6 rounded-2xl flex items-center justify-between shadow-sm border-2 bg-white ${bs.isBalanced ? 'border-teal-500/30 shadow-teal-900/5' : 'border-rose-500/30 shadow-rose-900/5'}`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 flex items-center gap-2">
          <Activity size={12} className={bs.isBalanced ? 'text-teal-600' : 'text-rose-600'} /> System Balance Health
        </p>
        <p className={`text-2xl font-black ${bs.isBalanced ? 'text-slate-900' : 'text-black-700'}`}>{bs.isBalanced ? 'Statement Balanced' : 'Discrepancy Detected'}</p>
        {!bs.isBalanced && (
          <p className="text-[11px] font-bold text-rose-500 mt-1 uppercase tracking-wider">
            Variance: {fmt(Math.abs(bs.totalAssets - (bs.totalLiabilities + bs.totalEquity)))} •
            {bs.totalAssets > (bs.totalLiabilities + bs.totalEquity) ? ' Assets are higher' : ' Liabilities/Equity are higher'}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Verified Assets</p>
        <p className="text-xl font-black text-slate-900">{fmt(bs.totalAssets)}</p>
      </div>
    </div>
  </div>
);

const TBReport = ({ tb, fmt, loading }) => {
  const totalDebit = tb.reduce((s, a) => s + (a.debit || 0), 0);
  const totalCredit = tb.reduce((s, a) => s + (a.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="card p-0 overflow-hidden border-slate-200 shadow-md">
      <div className="overflow-x-auto">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6 py-4">Account Classification</th>
              <th className="text-center">Type</th>
              <th className="text-right">Debit Balance</th>
              <th className="text-right px-6">Credit Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tb.map((acc, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-[14px] font-bold text-slate-900">{acc.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{acc.subType}</p>
                </td>
                <td className="text-center"><span className="badge badge-neutral uppercase tracking-tighter text-[10px]">{acc.type}</span></td>
                <td className="text-right font-black text-rose-600 text-[14px] tabular-nums">{acc.debit > 0 ? fmt(acc.debit) : '—'}</td>
                <td className="text-right px-6 font-black text-emerald-600 text-[14px] tabular-nums">{acc.credit > 0 ? fmt(acc.credit) : '—'}</td>
              </tr>
            ))}
            {!tb.length && !loading && <tr><td colSpan="4" className="p-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">No financial data detected</td></tr>}
            {loading && <tr><td colSpan="4" className="p-16 text-center"><div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[11px]"><RefreshCcw className="animate-spin" size={16} /> Retrieving Ledger...</div></td></tr>}
          </tbody>
        </table>
      </div>
      {tb.length > 0 && (
        <div className={`p-6 flex items-center justify-between text-white border-t border-white/10 ${isBalanced ? 'bg-slate-900' : 'bg-rose-600'}`}>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Total Debits</p>
            <p className="text-2xl font-black tabular-nums">{fmt(totalDebit)}</p>
          </div>
          <div className="flex-1 text-center">
            <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/20 shadow-lg ${isBalanced ? 'bg-white/10' : 'bg-white/20 animate-pulse'}`}>
              <div className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-emerald-400' : 'bg-white'}`}></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isBalanced ? 'System Balanced' : 'Ledger Error'}</span>
            </div>
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Total Credits</p>
            <p className="text-2xl font-black tabular-nums">{fmt(totalCredit)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReports;
