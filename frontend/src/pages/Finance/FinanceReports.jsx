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

const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('pl');
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const { data: tbData, isLoading: tbLoading } = useGetTrialBalanceQuery();
  const { data: plData, isLoading: plLoading } = useGetProfitAndLossQuery(filters);
  const { data: bsData, isLoading: bsLoading } = useGetBalanceSheetQuery();

  const trialBalance = tbData?.data || [];
  const pl = plData?.data || { income: [], expenses: [], totalIncome: 0, totalExpenses: 0, netProfit: 0 };
  const bs = bsData?.data || { assets: [], liabilities: [], equity: [], totalAssets: 0, totalLiabilities: 0, totalEquity: 0 };

  const tabs = [
    { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'bs', label: 'Balance Sheet', icon: Landmark },
    { id: 'tb', label: 'Trial Balance', icon: Activity },
  ];

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Professional accounting statements and summaries</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg h-[34px] px-2 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" className="bg-transparent border-none text-[12px] font-bold outline-none focus:ring-0 p-0" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
            <span className="text-slate-300 text-[10px] font-bold">TO</span>
            <input type="date" className="bg-transparent border-none text-[12px] font-bold outline-none focus:ring-0 p-0" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <button onClick={() => setFilters({ startDate: '', endDate: '' })} className="btn btn-secondary btn-md w-[34px] p-0"><RefreshCcw size={14} /></button>
          <button className="btn btn-primary btn-md"><Download size={14} /> <span className="hidden sm:inline ml-1.5">Export</span></button>
        </div>
      </div>

      <div className="flex bg-slate-100 p-0.5 rounded-lg w-max no-print">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
          {activeTab === 'pl' && <PLReport pl={pl} fmt={fmt} />}
          {activeTab === 'bs' && <BSReport bs={bs} fmt={fmt} />}
          {activeTab === 'tb' && <TBReport tb={trialBalance} fmt={fmt} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PLReport = ({ pl, fmt }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-emerald-50 bg-emerald-50/20 flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} /> Income</h2>
          <span className="text-lg font-bold text-emerald-600">{fmt(pl.totalIncome)}</span>
        </div>
        <div className="p-5 space-y-4">
          {pl.income.map((acc, i) => (
            <div key={i} className="flex justify-between items-center group">
              <div><p className="text-[13px] font-bold text-slate-900">{acc.name}</p><p className="text-[10px] text-slate-400 font-medium uppercase">{acc.subType}</p></div>
              <span className="text-[13px] font-bold text-slate-900">{fmt(acc.balance)}</span>
            </div>
          ))}
          {!pl.income.length && <p className="text-xs text-slate-400 italic text-center py-4">No income recorded</p>}
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-rose-50 bg-rose-50/20 flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-2"><TrendingDown size={14} /> Expenses</h2>
          <span className="text-lg font-bold text-rose-500">{fmt(pl.totalExpenses)}</span>
        </div>
        <div className="p-5 space-y-4">
          {pl.expenses.map((acc, i) => (
            <div key={i} className="flex justify-between items-center group">
              <div><p className="text-[13px] font-bold text-slate-900">{acc.name}</p><p className="text-[10px] text-slate-400 font-medium uppercase">{acc.subType}</p></div>
              <span className="text-[13px] font-bold text-slate-900">{fmt(acc.balance)}</span>
            </div>
          ))}
          {!pl.expenses.length && <p className="text-xs text-slate-400 italic text-center py-4">No expenses recorded</p>}
        </div>
      </div>
    </div>
    <div className={`p-6 rounded-lg flex items-center justify-between ${pl.netProfit >= 0 ? 'bg-[#044343] text-white' : 'bg-rose-500 text-white'}`}>
      <div><p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Net Profit / Loss</p><h3 className="text-2xl font-bold mt-0.5">{fmt(pl.netProfit)}</h3></div>
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">{pl.netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}</div>
    </div>
  </div>
);

const BSReport = ({ bs, fmt }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><Landmark size={14} /> Assets</h2>
          <span className="text-lg font-bold text-slate-900">{fmt(bs.totalAssets)}</span>
        </div>
        <div className="p-5 space-y-4">
          {bs.assets.map((acc, i) => (
            <div key={i} className="flex justify-between items-center"><span className="text-[13px] font-bold text-slate-900">{acc.name}</span><span className="text-[13px] font-bold text-slate-900">{fmt(acc.balance)}</span></div>
          ))}
        </div>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="card p-0 overflow-hidden flex-1">
          <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Liabilities</h2>
            <span className="text-sm font-bold text-slate-900">{fmt(bs.totalLiabilities)}</span>
          </div>
          <div className="p-5 space-y-3">
             {bs.liabilities.map((acc, i) => <div key={i} className="flex justify-between items-center text-[13px] font-bold text-slate-900"><span>{acc.name}</span><span>{fmt(acc.balance)}</span></div>)}
          </div>
        </div>
        <div className="card p-0 overflow-hidden flex-1">
          <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Equity</h2>
            <span className="text-sm font-bold text-slate-900">{fmt(bs.totalEquity)}</span>
          </div>
          <div className="p-5 space-y-3">
             {bs.equity.map((acc, i) => <div key={i} className="flex justify-between items-center text-[13px] font-bold text-slate-900"><span>{acc.name}</span><span>{fmt(acc.balance)}</span></div>)}
          </div>
        </div>
      </div>
    </div>
    <div className={`p-5 rounded-lg flex items-center justify-between text-white ${bs.isBalanced ? 'bg-[#044343]' : 'bg-rose-500'}`}>
       <div><p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Balance Status</p><p className="text-xl font-bold mt-0.5">{bs.isBalanced ? 'Accounts Match' : 'Discrepancy Found'}</p></div>
       <div className="text-right">
         <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total A = L+E</p>
         <p className="text-lg font-bold">{fmt(bs.totalAssets)}</p>
       </div>
    </div>
  </div>
);

const TBReport = ({ tb, fmt }) => (
  <div className="card p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="table-main">
        <thead>
          <tr>
            <th className="px-5">Account Classification</th>
            <th className="text-center">Type</th>
            <th className="text-right">Debit</th>
            <th className="text-right px-5">Credit</th>
          </tr>
        </thead>
        <tbody>
          {tb.map((acc, i) => (
            <tr key={i}>
              <td className="px-5">
                <p className="text-[13px] font-bold text-slate-900">{acc.name}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{acc.subType}</p>
              </td>
              <td className="text-center"><span className="badge badge-neutral lowercase">{acc.type}</span></td>
              <td className="text-right font-bold text-rose-500 text-[13px]">{acc.debit > 0 ? fmt(acc.debit) : '-'}</td>
              <td className="text-right px-5 font-bold text-emerald-600 text-[13px]">{acc.credit > 0 ? fmt(acc.credit) : '-'}</td>
            </tr>
          ))}
          {!tb.length && <tr><td colSpan="4" className="p-10 text-center text-slate-400 text-xs italic">No data found</td></tr>}
        </tbody>
      </table>
    </div>
    {tb.length > 0 && (() => {
      const totalDebit = tb.reduce((s, a) => s + (a.debit || 0), 0);
      const totalCredit = tb.reduce((s, a) => s + (a.credit || 0), 0);
      const match = Math.abs(totalDebit - totalCredit) < 0.01;
      return (
        <div className={`p-4 flex items-center justify-between text-white ${match ? 'bg-slate-900' : 'bg-rose-500 animate-pulse'}`}>
           <div><p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Debit</p><p className="text-lg font-bold">{fmt(totalDebit)}</p></div>
           <div className="text-center"><p className="text-[10px] font-bold uppercase tracking-widest">{match ? 'Balanced' : 'Error'}</p></div>
           <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Credit</p><p className="text-lg font-bold">{fmt(totalCredit)}</p></div>
        </div>
      );
    })()}
  </div>
);

export default FinanceReports;
