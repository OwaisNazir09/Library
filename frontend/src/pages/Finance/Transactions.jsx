import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpRight, ArrowDownRight, IndianRupee, Download, User, Calendar } from 'lucide-react';
import { useGetTransactionsQuery } from '../../store/api/financeApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const limit = 15;

  const { data: transactionsData, isLoading: loading } = useGetTransactionsQuery({ 
    page: currentPage, 
    limit, 
    ...filters 
  });

  const transactions = transactionsData?.data || [];
  const totalTransactions = transactionsData?.total || 0;

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-slate-500 font-medium mt-1">Full financial history and audit logs</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all shadow-sm">
             <Download size={14} /> Export CSV
           </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Type</label>
          <select 
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-[#044343]/10"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="fine">Fine</option>
            <option value="credit_note">Credit Note</option>
            <option value="debit_note">Debit Note</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Start Date</label>
          <input 
            type="date"
            value={filters.startDate}
            onChange={e => setFilters({...filters, startDate: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-[#044343]/10"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">End Date</label>
          <input 
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({...filters, endDate: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-[#044343]/10"
          />
        </div>
        <button 
          onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}
          className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          Reset
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5">Related Student</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && transactions.length === 0 ? (
                <tr>
                   <td colSpan="6" className="p-8">
                      <LoadingSkeleton type="table" rows={10} />
                   </td>
                </tr>
              ) : transactions.map((tx) => {
                const style = TYPE_STYLE[tx.type] || TYPE_STYLE.adjustment;
                return (
                  <tr key={tx._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                           <Calendar size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-900">{tx.description}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{tx.category?.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-5">
                      {tx.studentId ? (
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-[10px] text-[#044343] font-black">
                             {tx.studentId.fullName?.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-600">{tx.studentId.fullName}</span>
                         </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase italic">General</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.cls}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">
                       <span className={tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}>
                         {tx.type === 'expense' ? '−' : '+'}{fmt(tx.amount)}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       {tx.receiptId && (
                         <button className="text-slate-300 hover:text-[#044343] transition-colors p-2">
                            <Download size={16} />
                         </button>
                       )}
                    </td>
                  </tr>
                );
              })}
              
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <IndianRupee size={32} />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight text-lg">No Transactions Found</p>
                    <p className="text-slate-400 text-sm font-medium mt-1">Try adjusting your filters or record a new transaction.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalTransactions > 0 && (
          <div className="border-t border-slate-50">
            <Pagination 
              total={totalTransactions}
              limit={limit}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
