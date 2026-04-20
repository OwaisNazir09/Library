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

  const getBadgeStyle = (type) => {
    switch(type) {
      case 'income': return 'badge-success';
      case 'expense': return 'badge-danger';
      case 'fine': return 'badge-warning';
      case 'refund': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <FinanceHeader onAction={handleAction} />

      <UniversalTransactionModal
        initialType={modal.type || 'journal'}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
      />

      {/* Filters Bar */}
      <div className="card py-3 px-5 flex flex-wrap items-center gap-3">
        {!forcedType && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Type:</span>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="fine">Fine</option>
              <option value="transfer">Transfer</option>
              <option value="journal">Journal</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-slate-400" />
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" />
          <span className="text-slate-300 font-bold">to</span>
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" />
        </div>
        <button onClick={() => setFilters({ type: forcedType || '', category: '', startDate: '', endDate: '' })} className="btn btn-ghost btn-sm text-[10px] font-bold uppercase ml-auto">
          Reset Filters
        </button>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Date</th>
              <th>Description</th>
              <th>Member / Category</th>
              <th className="text-center">Type</th>
              <th className="text-right">Amount</th>
              <th className="px-5 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 ? (
              <tr><td colSpan="6" className="p-8"><LoadingSkeleton type="table" rows={10} /></td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="px-5">
                    <span className="text-[13px] font-bold text-slate-900">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                  </td>
                  <td>
                    <p className="text-[13px] font-bold text-slate-900 truncate max-w-[250px]">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{tx.transactionRef}</p>
                  </td>
                  <td>
                    {tx.studentId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-teal-50 flex items-center justify-center text-[9px] text-[#044343] font-bold border border-teal-100">
                          {tx.studentId.fullName?.charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">{tx.studentId.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 capitalize">{tx.category?.replace('_', ' ') || 'General'}</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${getBadgeStyle(tx.type)} lowercase`}>{tx.type}</span>
                  </td>
                  <td className="text-right font-bold text-[14px]">
                    <span className={tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}>
                      {tx.type === 'expense' ? '−' : '+'}{fmt(tx.amount)}
                    </span>
                  </td>
                  <td className="px-5 text-center">
                    {tx.receiptId && (
                      <button className="text-slate-300 hover:text-slate-900 transition-colors">
                        <Download size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
            {!loading && transactions.length === 0 && (
              <tr><td colSpan="6" className="px-5 py-20 text-center text-slate-400 text-sm font-medium">No transactions match your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2 no-print">
        <p className="text-xs text-slate-500 font-medium">Showing {transactions.length} transactions</p>
        <Pagination total={totalTransactions} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default Transactions;
