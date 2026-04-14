import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, 
  Landmark, FileText, Download, IndianRupee, 
  Layers, ChevronRight, Activity, Wallet
} from 'lucide-react';
import { 
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetBalanceSheetQuery
} from '../../store/api/financeApi';

const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('pl');

  const { data: tbData, isLoading: tbLoading } = useGetTrialBalanceQuery();
  const { data: plData, isLoading: plLoading } = useGetProfitAndLossQuery();
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
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Professional financial statements</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#044343] text-white px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:bg-[#033636] transition-all">
          <Download size={16} /> Export Statement
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-1 no-scrollbar">
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
          {activeTab === 'pl' && <PLReport pl={pl} fmt={fmt} />}
          {activeTab === 'bs' && <BSReport bs={bs} fmt={fmt} />}
          {activeTab === 'tb' && <TBReport tb={trialBalance} fmt={fmt} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PLReport = ({ pl, fmt }) => (
  <div className="space-y-6 md:space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-emerald-50/30 flex items-center justify-between">
          <h2 className="text-[10px] md:text-sm font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> Revenue
          </h2>
          <span className="text-lg md:text-xl font-black text-emerald-600">{fmt(pl.totalIncome)}</span>
        </div>
        <div className="divide-y divide-slate-50 px-6 md:px-10 py-4 flex-1">
          {pl.income.map((acc, i) => (
            <div key={i} className="flex justify-between py-3 md:py-4 group">
              <span className="text-xs md:text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{acc.name}</span>
              <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
            </div>
          ))}
          {pl.income.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No income recorded.</div>}
        </div>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-rose-50/30 flex items-center justify-between">
          <h2 className="text-[10px] md:text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5" /> Expenses
          </h2>
          <span className="text-lg md:text-xl font-black text-rose-500">{fmt(pl.totalExpenses)}</span>
        </div>
        <div className="divide-y divide-slate-50 px-6 md:px-10 py-4 flex-1">
          {pl.expenses.map((acc, i) => (
            <div key={i} className="flex justify-between py-3 md:py-4 group">
              <span className="text-xs md:text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{acc.name}</span>
              <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
            </div>
          ))}
          {pl.expenses.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No expenses recorded.</div>}
        </div>
      </div>
    </div>
    <div className={`p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 ${pl.netProfit >= 0 ? 'bg-[#044343] text-white' : 'bg-rose-500 text-white'}`}>
      <div>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Net Profit / Loss</p>
        <p className="text-sm font-medium mt-1 opacity-80">Total Income minus Total Expenses</p>
      </div>
      <div className="flex items-center gap-4">
        <h3 className="text-3xl md:text-5xl font-black tracking-tighter shadow-sm">{fmt(pl.netProfit)}</h3>
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-md">
           <Activity className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
      </div>
    </div>
  </div>
);

const BSReport = ({ bs, fmt }) => (
  <div className="space-y-6 md:space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-teal-50/30 flex items-center justify-between">
          <h2 className="text-[10px] md:text-sm font-black text-teal-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
             Assets
          </h2>
          <span className="text-lg md:text-xl font-black text-teal-600">{fmt(bs.totalAssets)}</span>
        </div>
        <div className="p-6 md:p-10 divide-y divide-slate-50">
          {bs.assets.map((acc, i) => (
            <div key={i} className="flex justify-between py-3 md:py-4">
              <span className="text-xs md:text-sm font-bold text-slate-600 truncate pr-4">{acc.name}</span>
              <span className="text-xs md:text-sm font-black text-slate-900 shrink-0">{fmt(acc.balance)}</span>
            </div>
          ))}
          {bs.assets.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No assets recorded.</div>}
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-rose-50/30 flex items-center justify-between">
            <h2 className="text-[10px] md:text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
               Liabilities
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
            {bs.liabilities.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No liabilities recorded.</div>}
          </div>
        </div>

        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 bg-indigo-50/30 flex items-center justify-between">
            <h2 className="text-[10px] md:text-sm font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2 md:gap-3">
               Equity
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
            {bs.equity.length === 0 && <div className="py-8 text-center text-slate-400 font-bold italic text-xs">No equity accounts recorded.</div>}
          </div>
        </div>
      </div>
    </div>
    
    <div className={`p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] flex items-center justify-between gap-6 ${bs.isBalanced ? 'bg-[#044343] text-white' : 'bg-rose-500 text-white'}`}>
       <div className="flex-1">
         <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Total Assets</p>
         <p className="text-2xl md:text-4xl font-black tracking-tighter mt-1">{fmt(bs.totalAssets)}</p>
       </div>
       
       <div className="hidden md:flex flex-col items-center justify-center px-8 border-x border-white/20">
         <div className={`p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-2 ${!bs.isBalanced && 'animate-pulse'}`}>
           <BarChart3 className="w-6 h-6 text-white" />
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest">{bs.isBalanced ? 'Balanced' : 'Discrepancy Detected'}</span>
       </div>

       <div className="flex-1 text-right">
         <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Liabilities + Equity</p>
         <p className="text-2xl md:text-4xl font-black tracking-tighter mt-1">{fmt(bs.totalLiabilities + bs.totalEquity)}</p>
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
            <th className="px-6 md:px-10 py-5 md:py-6">Account Name</th>
            <th className="px-6 md:px-10 py-5 md:py-6 text-center">Type</th>
            <th className="px-6 md:px-10 py-5 md:py-6 text-right">Debit (INR)</th>
            <th className="px-6 md:px-10 py-5 md:py-6 text-right">Credit (INR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {tb.map((acc, i) => (
            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
              <td className="px-6 md:px-10 py-4 md:py-5 font-bold text-slate-900 text-xs md:text-sm">{acc.name}</td>
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
              <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic text-xs">No ledger accounts found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
    {tb.length > 0 && (() => {
      const totalDebit = tb.reduce((s, a) => s + a.debit, 0);
      const totalCredit = tb.reduce((s, a) => s + a.credit, 0);
      const match = totalDebit === totalCredit;
      
      return (
        <div className={`p-6 md:p-8 flex items-center justify-between gap-6 ${match ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
           <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Debit</p>
             <p className="text-xl md:text-2xl font-black mt-1">{fmt(totalDebit)}</p>
           </div>
           <div className="hidden md:flex flex-col items-center border-x border-white/20 px-8">
             <span className="text-[10px] font-black uppercase tracking-widest">{match ? 'Statement Balanced' : `Discrepancy: ${fmt(Math.abs(totalDebit - totalCredit))}`}</span>
           </div>
           <div className="flex-1 text-right">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Credit</p>
             <p className="text-xl md:text-2xl font-black mt-1">{fmt(totalCredit)}</p>
           </div>
        </div>
      );
    })()}
  </div>
);

export default FinanceReports;
