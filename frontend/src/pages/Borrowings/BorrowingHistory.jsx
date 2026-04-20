import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetBorrowingsQuery, useReturnBookMutation, useIssueBookMutation } from '../../store/api/circulationApi';
import { useGetBooksQuery } from '../../store/api/booksApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Hash, 
  IndianRupee, 
  Plus,
  X,
  Book,
  User as UserIcon,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast';
import { format, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const BorrowingHistory = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const limit = 10;

  const { data: borrowingsData, isLoading: loading, error, refetch } = useGetBorrowingsQuery({
    page: currentPage,
    limit,
    search: searchTerm
  });

  const { data: booksData } = useGetBooksQuery({ limit: 1000 });
  const { data: usersData } = useGetUsersQuery({ limit: 1000 });

  const items = [...(borrowingsData?.data?.borrowings || [])].sort((a, b) => {
    const dateA = new Date(a.borrowedDate || a.createdAt || 0);
    const dateB = new Date(b.borrowedDate || b.createdAt || 0);
    return dateB - dateA;
  });
  const total = borrowingsData?.total || borrowingsData?.results || 0;
  const books = booksData?.data?.books || booksData?.data || [];
  const users = usersData?.data?.users || usersData?.data || [];

  const [issueBookMutation, { isLoading: isIssuing }] = useIssueBookMutation();
  const [returnBookMutation, { isLoading: isReturning }] = useReturnBookMutation();

  const [isIssueModalOpen, setIsIssueModalOpen] = React.useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      borrowedDate: new Date().toISOString().split('T')[0],
      finePerDay: 5
    }
  });

  const watchBorrowedDate = watch('borrowedDate');

  const onIssueSubmit = async (data) => {
    try {
      await issueBookMutation(data).unwrap();
      toast.success('Book issued effectively!');
      setIsIssueModalOpen(false);
      reset();
    } catch (err) {
      // Handled globally
    }
  };

  const handleReturn = async (id) => {
    try {
      await returnBookMutation(id).unwrap();
      toast.success('Book successfully returned to inventory');
    } catch (err) {
      // Handled globally
    }
  };

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const setDays = (days) => {
    if (!watchBorrowedDate) return;
    const date = new Date(watchBorrowedDate);
    date.setDate(date.getDate() + days);
    setValue('dueDate', date.toISOString().split('T')[0]);
  };

  const getStatus = (record) => {
    if (record.status === 'returned') return 'Returned';
    const dueDate = new Date(record.dueDate);
    if (isAfter(new Date(), dueDate)) return 'Late';
    return 'Borrowed';
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="p-8">
            <LoadingSkeleton type="table" rows={6} />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="9" className="p-12">
            <ErrorState message={error.data?.message || 'Error loading borrowings'} onRetry={refetch} />
          </td>
        </tr>
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="p-12">
            <EmptyState
              title="No Active Borrowings"
              message="There are currently no books out on loan. All items are in the library inventory."
              icon={Clock}
            />
          </td>
        </tr>
      );
    }

    return items.map((record) => {
      const status = getStatus(record);
      return (
        <tr key={record.id || record._id} className="hover:bg-slate-50/50 transition-colors group text-sm">
          <td className="px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${record.user?.fullName || record.user?.name}&background=random`} alt="user" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">{record.user?.fullName || record.user?.name}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5 tracking-widest uppercase">{record.user?.role || 'Member'}</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <p className="text-xs font-bold text-slate-900 leading-tight">{record.book?.title}</p>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{record.book?.isbn}</p>
          </td>
          <td className="px-6 py-5 text-center">
             <p className="text-[10px] font-black text-slate-600 bg-slate-100 py-1 px-2 rounded-lg inline-block">
               {record.borrowedDate ? format(new Date(record.borrowedDate), 'dd MMM yyyy') : '-'}
             </p>
          </td>
          <td className="px-6 py-5 text-center">
             <p className="text-[10px] font-black text-rose-600 bg-rose-50 py-1 px-2 rounded-lg inline-block">
               {record.dueDate ? format(new Date(record.dueDate), 'dd MMM yyyy') : '-'}
             </p>
          </td>
          <td className="px-6 py-5 text-center">
             <p className={`text-[10px] font-black py-1 px-2 rounded-lg inline-block ${record.returnedDate ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 bg-slate-50'}`}>
               {record.returnedDate ? format(new Date(record.returnedDate), 'dd MMM yyyy') : 'Not Returned'}
             </p>
          </td>
          <td className="px-6 py-5 text-center">
             <div className="text-xs font-black text-slate-900 flex flex-col items-center">
                <span className={record.lateDays > 0 ? 'text-rose-600' : 'text-slate-400'}>{record.lateDays || 0} Days</span>
             </div>
          </td>
          <td className="px-6 py-5 text-center">
             <div className="text-xs font-black text-slate-900 flex flex-col items-center">
                <span className={record.fineAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>₹{record.fineAmount || 0}</span>
             </div>
          </td>
          <td className="px-6 py-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                status === 'Returned' ? 'bg-emerald-100 text-emerald-600' :
                status === 'Late' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
              }`}>
              {status === 'Returned' && <CheckCircle size={10} />}
              {status === 'Late' && <AlertCircle size={10} />}
              {status === 'Borrowed' && <Clock size={10} />}
              {status}
            </span>
          </td>
          <td className="px-8 py-5 text-right">
            {record.status === 'borrowed' ? (
              <button
                onClick={() => handleReturn(record.id || record._id)}
                disabled={isReturning}
                className="btn btn-sm btn-secondary w-full"
              >
                {isReturning ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Return Book'}
              </button>
            ) : (
              <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
                <ArrowUpRight size={18} />
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            <span>Library</span>
            <ChevronRight size={12} />
            <span className="text-[#044343]">Circulation</span>
          </div>
          <h1>Borrowing History</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by member or book..."
              value={searchTerm}
              onChange={onSearchChange}
              className="input-field pl-9 w-64"
            />
          </div>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="btn btn-primary btn-default"
          >
            <Plus size={16} />
            Issue Book
          </button>
        </div>
      </div>

      <div className="compact-table-container">
        <table className="compact-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Book Asset</th>
              <th className="text-center">Borrow Date</th>
              <th className="text-center">Due Date</th>
              <th className="text-center">Return Date</th>
              <th className="text-center">Late Days</th>
              <th className="text-center">Fine (₹)</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination 
          total={total}
          limit={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Issue Book Modal */}
      <AnimatePresence>
        {isIssueModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content modal-lg max-h-[90vh]"
            >
              <div className="modal-header">
                <h2>Borrow Book Asset</h2>
                <button
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onIssueSubmit)} className="flex flex-col overflow-hidden">
                <div className="modal-body space-y-6">
                {/* Section 1: Member & Asset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Select Member</label>
                    <select
                      {...register('userId', { required: true })}
                      className="input-field"
                    >
                      <option value="">Choose member...</option>
                      {users?.map(u => (
                        <option key={u._id || u.id} value={u._id || u.id}>{u.fullName || u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Select Book Asset</label>
                    <select
                      {...register('bookId', { required: true })}
                      className="input-field"
                    >
                      <option value="">Choose available book...</option>
                      {books?.map(b => (
                        <option 
                          key={b._id || b.id} 
                          value={b._id || b.id}
                          disabled={b.availableCopies <= 0}
                        >
                          {b.title} {b.availableCopies <= 0 ? '(No Copies)' : `(Available: ${b.availableCopies})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: Dates & Fine Settings */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Borrow Date</label>
                        <input 
                          {...register('borrowedDate', { required: true })} 
                          type="date" 
                          className="input-field" 
                        />
                      </div>

                      <div>
                        <label className="input-label">Due Date</label>
                        <input 
                          {...register('dueDate', { required: true })} 
                          type="date" 
                          className="input-field" 
                        />
                      </div>

                      <div className="sm:col-span-2 flex gap-2">
                         <button type="button" onClick={() => setDays(7)} className="btn btn-sm btn-secondary">7 Days</button>
                         <button type="button" onClick={() => setDays(14)} className="btn btn-sm btn-secondary">14 Days</button>
                         <button type="button" onClick={() => setDays(30)} className="btn btn-sm btn-secondary">30 Days</button>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="input-label">Fine Per Day (₹)</label>
                        <input 
                          {...register('finePerDay', { required: true })} 
                          type="number" 
                          className="input-field" 
                          placeholder="5"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Applied automatically if returned after due date.</p>
                      </div>
                    </div>
                </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="btn btn-secondary btn-default"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isIssuing}
                    className="btn btn-primary btn-default min-w-[120px]"
                  >
                    {isIssuing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Issue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BorrowingHistory;
