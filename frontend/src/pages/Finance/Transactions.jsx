import React, { useState } from 'react';
import { useGetTransactionsQuery } from '../../store/api/financeApi';
import { format } from 'date-fns';
import { 
  Download, Filter, Search, Calendar, ChevronLeft, ChevronRight, 
  ArrowDownRight, ArrowUpRight, History, MoreVertical 
} from 'lucide-react';
import FinanceHeader from './FinanceHeader';
import UniversalTransactionModal from './UniversalTransactionModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import { IndianRupee } from 'lucide-react';

const Transactions = ({ type: forcedType }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({ type: null, isOpen: false });
  const [filters, setFilters] = useState({
    type: forcedType || '',
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

  const handleAction = (type) => setModal({ type, isOpen: true });

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const TYPE_STYLE = {
    income: { label: 'Income', cls: 'bg-emerald-100 text-emerald-700' },
    expense: { label: 'Expense', cls: 'bg-rose-100 text-rose-700' },
    fine: { label: 'Fine', cls: 'bg-amber-100 text-amber-700' },
    credit_note: { label: 'Credit Note', cls: 'bg-sky-100 text-sky-700' },
    debit_note: { label: 'Debit Note', cls: 'bg-purple-100 text-purple-700' },
    refund: { label: 'Refund', cls: 'bg-indigo-100 text-indigo-700' },
    adjustment: { label: 'Adjustment', cls: 'bg-slate-100 text-slate-700' },
    transfer: { label: 'Transfer', cls: 'bg-indigo-100 text-indigo-700' },
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <FinanceHeader onAction={handleAction} />

      <UniversalTransactionModal
        initialType={modal.type || 'journal'}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
      />

      {/* Filters Bar */}
      <div className="bg-white p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-end gap-4 transition-all duration-300">
        {!forcedType && (
          <div className="flex-1 min-w-0 md:min-w-[150px]">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-2">Type</label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="w-full h-11 md:h-12 px-4 py-2 bg-slate-50 border-none rounded-xl font-bold text-xs md:text-sm text-slate-700 focus:ring-2 focus:ring-[#044343]/10"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="fine">Fine</option>
              <option value="transfer">Transfer</option>
              <option value="journal">Journal</option>
              <option value="payment">Payment</option>
            </select>
          </div>
        )}
        <div className="flex-1 min-w-0 md:min-w-[150px]">
          <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-2">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full h-11 md:h-12 px-4 py-2 bg-slate-50 border-none rounded-xl font-bold text-xs md:text-sm text-slate-700 focus:ring-2 focus:ring-[#044343]/10"
          />
        </div>
        <div className="flex-1 min-w-0 md:min-w-[150px]">
          <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-2">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full h-11 md:h-12 px-4 py-2 bg-slate-50 border-none rounded-xl font-bold text-xs md:text-sm text-slate-700 focus:ring-2 focus:ring-[#044343]/10"
          />
        </div>
        <button
          onClick={() => setFilters({ type: forcedType || '', category: '', startDate: '', endDate: '' })}
          className="h-11 md:h-12 px-6 bg-slate-100 text-slate-500 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all sm:w-fit"
        >
          Reset
        </button>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[800px] md:min-w-0">
            <thead className="bg-slate-50/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-6 md:px-8 py-5">Date</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5">Related To</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5 text-right">Amount</th>
                <th className="px-6 md:px-8 py-5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8">
                    <LoadingSkeleton type="table" rows={10} />
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const style = TYPE_STYLE[tx.type] || TYPE_STYLE.adjustment;
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 md:px-8 py-4 md:py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                            <Calendar size={14} />
                          </div>
                          <span className="text-xs md:text-sm font-bold text-slate-900">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 md:py-5">
                        <span className="text-xs md:text-sm font-black text-slate-900 line-clamp-1">{tx.description}</span>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{tx.category?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-6 py-4 md:py-5">
                        {tx.studentId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-[9px] text-[#044343] font-black uppercase">
                              {tx.studentId.fullName?.charAt(0)}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-slate-600 truncate max-w-[100px]">{tx.studentId.fullName}</span>
                          </div>
                        ) : tx.type === 'transfer' ? (
                          <span className="text-[9px] font-black text-indigo-400 uppercase italic">Transfer</span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 uppercase italic">General</span>
                        )}
                      </td>
                      <td className="px-6 py-4 md:py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${style.cls}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 md:py-5 text-right font-black text-slate-900">
                        <span className={tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}>
                          {tx.type === 'expense' ? '−' : '+'}{fmt(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-5 text-center">
                        {tx.receiptId && (
                          <button className="text-slate-300 hover:text-[#044343] transition-colors p-2">
                            <Download size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}

              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <IndianRupee size={32} />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight text-lg">No Transactions Found</p>
                    <p className="text-slate-400 text-sm font-medium mt-1">Try adjusting your filters or record a new entry.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalTransactions > 0 && (
          <div className="border-t border-slate-50 mt-auto">
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
