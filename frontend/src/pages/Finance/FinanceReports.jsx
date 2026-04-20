import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, 
  Landmark, FileText, Download, IndianRupee, 
  Layers, ChevronRight, Activity, Wallet,
  Calendar, Filter, RefreshCcw, ArrowRight
} from 'lucide-react';
import { 
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetBalanceSheetQuery
} from '../../store/api/financeApi';
import { format } from 'date-fns';

const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('pl');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const { data: tbData, isLoading: tbLoading } = useGetTrialBalanceQuery();
  const { data: plData, isLoading: plLoading, refetch: refetchPL } = useGetProfitAndLossQuery(filters);
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

  const resetFilters = () => setFilters({ startDate: '', endDate: '' });

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Professional Accounting Statements</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm">
            <Calendar size={16} className="text-slate-300 ml-2" />
            <input 
              type="date" 
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 w-28"
              value={filters.startDate}
              onChange={e => setFilters({...filters, startDate: e.target.value})}
            />
            <ArrowRight size={14} className="text-slate-300" />
            <input 
              type="date" 
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 w-28"
              value={filters.endDate}
              onChange={e => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
          <button 
            onClick={resetFilters}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
            title="Reset Filters"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-1 no-scrollbar no-print">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-max md:w-fit mx-auto md:mx-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-[#044343] shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'pl' && <PLReport pl={pl} fmt={fmt} filters={filters} />}
          {activeTab === 'bs' && <BSReport bs={bs} fmt={fmt} />}
          {activeTab === 'tb' && <TBReport tb={trialBalance} fmt={fmt} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PLReport = ({ pl, fmt, filters }) => (
  <div className="space-y-6 md:space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Revenue Section */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-emerald-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] md:text-sm font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> Revenue Stream
            </h2>
            <p className="text-[9px] text-emerald-600/60 font-black uppercase tracking-widest mt-0.5">
              {filters.startDate ? `From ${format(new Date(filters.startDate), 'dd MMM')} to ${filters.endDate ? format(new Date(filters.endDate), 'dd MMM') : 'Now'}` : 'All Time'}
            </p>
          </div>
          <span className="text-lg md:text-xl font-black text-emerald-600">{fmt(pl.totalIncome)}</span>
        </div>
        <div className="divide-y divide-slate-50 px-6 md:px-10 py-4 flex-1">
          {pl.income.map((acc, i) => (
            <div key={i} className="flex justify-between py-3 md:py-4 group">
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{acc.name}</span>
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{acc.subType}</span>
              </div>
              <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
            </div>
          ))}
          {pl.income.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No income recorded for this period.</div>}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-rose-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] md:text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5" /> Operational Expenses
            </h2>
            <p className="text-[9px] text-rose-600/60 font-black uppercase tracking-widest mt-0.5">
              Cost of doing business
            </p>
          </div>
          <span className="text-lg md:text-xl font-black text-rose-500">{fmt(pl.totalExpenses)}</span>
        </div>
        <div className="divide-y divide-slate-50 px-6 md:px-10 py-4 flex-1">
          {pl.expenses.map((acc, i) => (
            <div key={i} className="flex justify-between py-3 md:py-4 group">
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{acc.name}</span>
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{acc.subType}</span>
              </div>
              <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
            </div>
          ))}
          {pl.expenses.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No expenses recorded for this period.</div>}
        </div>
      </div>
    </div>
    
    <div className={`p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 ${pl.netProfit >= 0 ? 'bg-[#044343] text-white shadow-xl shadow-teal-900/20' : 'bg-rose-500 text-white shadow-xl shadow-rose-900/20'}`}>
      <div>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Net Performance Summary</p>
        <p className="text-sm font-medium mt-1 opacity-80">Total Revenue minus Operational Costs</p>
      </div>
      <div className="flex items-center gap-4 md:gap-8">
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Bottom Line</p>
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter">{fmt(pl.netProfit)}</h3>
        </div>
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center bg-white/10 backdrop-blur-md">
           {pl.netProfit >= 0 ? <TrendingUp size={28} className="text-white" /> : <TrendingDown size={28} className="text-white" />}
        </div>
      </div>
    </div>
  </div>
);

const BSReport = ({ bs, fmt }) => (
  <div className="space-y-6 md:space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-teal-50/30 flex items-center justify-between">
          <h2 className="text-[10px] md:text-sm font-black text-teal-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
             <Landmark size={18} /> Asset Portfolio
          </h2>
          <span className="text-lg md:text-xl font-black text-teal-600">{fmt(bs.totalAssets)}</span>
        </div>
        <div className="p-6 md:p-10 divide-y divide-slate-50 flex-1">
          {bs.assets.map((acc, i) => (
            <div key={i} className="flex justify-between py-3 md:py-4">
              <span className="text-xs md:text-sm font-bold text-slate-600 truncate pr-4">{acc.name}</span>
              <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
            </div>
          ))}
          {bs.assets.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No assets found.</div>}
        </div>
      </div>

      <div className="space-y-6 md:space-y-8 flex flex-col">
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1">
          <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-rose-50/30 flex items-center justify-between">
            <h2 className="text-[10px] md:text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
               <Layers size={18} /> Obligations (Liabilities)
            </h2>
            <span className="text-lg md:text-xl font-black text-rose-500">{fmt(bs.totalLiabilities)}</span>
          </div>
          <div className="px-6 md:px-10 py-4 divide-y divide-slate-50">
             {bs.liabilities.map((acc, i) => (
              <div key={i} className="flex justify-between py-3 md:py-4">
                <span className="text-xs md:text-sm font-bold text-slate-600 truncate pr-4">{acc.name}</span>
                <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
              </div>
            ))}
            {bs.liabilities.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No current liabilities.</div>}
          </div>
        </div>

        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1">
          <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-indigo-50/30 flex items-center justify-between">
            <h2 className="text-[10px] md:text-sm font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
               <Activity size={18} /> Equity / Capital
            </h2>
            <span className="text-lg md:text-xl font-black text-indigo-500">{fmt(bs.totalEquity)}</span>
          </div>
          <div className="px-6 md:px-10 py-4 divide-y divide-slate-50">
             {bs.equity.map((acc, i) => (
              <div key={i} className="flex justify-between py-3 md:py-4">
                <span className="text-xs md:text-sm font-bold text-slate-600 truncate pr-4">{acc.name}</span>
                <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
              </div>
            ))}
            {bs.equity.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No capital accounts.</div>}
          </div>
        </div>
      </div>
    </div>
    
    <div className={`p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] flex items-center justify-between gap-6 ${bs.isBalanced ? 'bg-[#044343] text-white' : 'bg-rose-500 text-white'}`}>
       <div className="flex-1">
         <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Structural Integrity</p>
         <h4 className="text-2xl md:text-4xl font-black tracking-tighter mt-1">{fmt(bs.totalAssets)} <span className="text-base opacity-50 ml-2">Assets</span></h4>
       </div>
       
       <div className="hidden md:flex flex-col items-center justify-center px-8 border-x border-white/20">
         <div className={`p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-2 ${!bs.isBalanced && 'animate-pulse'}`}>
            {bs.isBalanced ? <Activity className="w-6 h-6 text-white" /> : <RefreshCcw className="w-6 h-6 text-white animate-spin" />}
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest">{bs.isBalanced ? 'Accounting Balanced' : 'Check Ledger (Discrepancy)'}</span>
       </div>

       <div className="flex-1 text-right">
         <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Claims Against Assets</p>
         <h4 className="text-2xl md:text-4xl font-black tracking-tighter mt-1">{fmt(bs.totalLiabilities + bs.totalEquity)} <span className="text-base opacity-50 ml-2">L+E</span></h4>
       </div>
    </div>
  </div>
);

const TBReport = ({ tb, fmt }) => (
  <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] md:min-w-0">
        <thead className="bg-slate-50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
          <tr>
            <th className="px-6 md:px-10 py-5 md:py-6">Account Classification</th>
            <th className="px-6 md:px-10 py-5 md:py-6 text-center">Type</th>
            <th className="px-6 md:px-10 py-5 md:py-6 text-right">Debit Balance</th>
            <th className="px-6 md:px-10 py-5 md:py-6 text-right">Credit Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {tb.map((acc, i) => (
            <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
              <td className="px-6 md:px-10 py-4 md:py-5">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-xs md:text-sm">{acc.name}</span>
                  <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{acc.subType}</span>
                </div>
              </td>
              <td className="px-6 md:px-10 py-4 md:py-5 text-center">
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">
                  {acc.type}
                </span>
              </td>
              <td className="px-6 md:px-10 py-4 md:py-5 text-right font-black text-rose-500 text-xs md:text-sm">{acc.debit > 0 ? fmt(acc.debit) : '-'}</td>
              <td className="px-6 md:px-10 py-4 md:py-5 text-right font-black text-emerald-600 text-xs md:text-sm">{acc.credit > 0 ? fmt(acc.credit) : '-'}</td>
            </tr>
          ))}
          {tb.length === 0 && (
            <tr>
              <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic text-xs">Trial Balance is empty. No accounts registered.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
    {tb.length > 0 && (() => {
      const totalDebit = tb.reduce((s, a) => s + a.debit, 0);
      const totalCredit = tb.reduce((s, a) => s + a.credit, 0);
      const match = Math.abs(totalDebit - totalCredit) < 0.01;
      
      return (
        <div className={`p-6 md:p-10 flex items-center justify-between gap-6 ${match ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
           <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Sum of Debits</p>
             <p className="text-xl md:text-3xl font-black mt-1 tracking-tighter">{fmt(totalDebit)}</p>
           </div>
           <div className="hidden md:flex flex-col items-center border-x border-white/20 px-10">
             <div className="p-2 rounded-lg bg-white/10 mb-2">
                <RefreshCcw size={16} className={match ? '' : 'animate-spin'} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-center">
               {match ? 'Statement Balanced' : `Discrepancy: ${fmt(Math.abs(totalDebit - totalCredit))}`}
             </span>
           </div>
           <div className="flex-1 text-right">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Sum of Credits</p>
             <p className="text-xl md:text-3xl font-black mt-1 tracking-tighter">{fmt(totalCredit)}</p>
           </div>
        </div>
      );
    })()}
  </div>
);

export default FinanceReports;
