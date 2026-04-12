import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBorrowings, returnBook } from '../../store/slices/borrowingSlice';
import { Search, Filter, ArrowUpRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { Clock as ClockIcon } from 'lucide-react';

const BorrowingHistory = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.borrowings);

  const loadBorrowings = React.useCallback(() => {
    dispatch(fetchBorrowings());
  }, [dispatch]);

  React.useEffect(() => {
    loadBorrowings();
  }, [loadBorrowings]);

  const handleReturn = async (id) => {
    const result = await dispatch(returnBook(id));
    if (returnBook.fulfilled.match(result)) {
      toast.success('Book successfully returned to inventory');
    }
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="p-8">
            <LoadingSkeleton type="table" rows={6} />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="6" className="p-12">
            <ErrorState message={error} onRetry={loadBorrowings} />
          </td>
        </tr>
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="p-12">
            <EmptyState 
              title="No Active Borrowings" 
              message="There are currently no books out on loan. All items are in the library inventory."
              icon={ClockIcon}
            />
          </td>
        </tr>
      );
    }

    return items.map((record) => (
      <tr key={record.id || record._id} className="hover:bg-slate-50/50 transition-colors group">
        <td className="px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
               <img src={`https://i.pravatar.cc/150?u=${record.user?._id}`} alt="user" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">{record.user?.name || record.user?.fullName}</p>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">ID: {record.user?._id?.substring(0, 8)}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
           <p className="text-xs font-bold text-slate-900 leading-tight">{record.book?.title}</p>
           <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{record.book?.isbn}</p>
        </td>
        <td className="px-6 py-5">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-500">Issued: {record.borrowDate ? format(new Date(record.borrowDate), 'MMM dd, yyyy') : 'N/A'}</p>
             <p className="text-[10px] font-bold text-rose-500">Due: {record.dueDate ? format(new Date(record.dueDate), 'MMM dd, yyyy') : 'N/A'}</p>
          </div>
        </td>
        <td className="px-6 py-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            record.status === 'returned' ? 'bg-emerald-100 text-emerald-600' : 
            record.status === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {record.status === 'returned' && <CheckCircle size={10} />}
            {record.status === 'overdue' && <AlertCircle size={10} />}
            {record.status === 'borrowed' && <Clock size={10} />}
            {record.status}
          </span>
        </td>
        <td className="px-6 py-5">
          <div className="text-xs font-black text-slate-900">
            {record.fine > 0 ? <span className="text-rose-600">${record.fine}</span> : '$0.00'}
          </div>
        </td>
        <td className="px-8 py-5 text-right">
          {record.status === 'borrowed' ? (
            <button 
              onClick={() => handleReturn(record.id || record._id)}
              className="px-4 py-2 bg-[#044343] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#033636] transition-all shadow-md shadow-teal-900/10 active:scale-95"
            >
              Return Book
            </button>
          ) : (
            <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
              <ArrowUpRight size={18} />
            </button>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Borrowing History</h1>
          <p className="text-slate-500 font-medium">Track all book loans, returns, and outstanding fines.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by user or book..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-[#044343] rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Member</th>
                <th className="px-6 py-5">Book Details</th>
                <th className="px-6 py-5">Dates</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Fine</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BorrowingHistory;
