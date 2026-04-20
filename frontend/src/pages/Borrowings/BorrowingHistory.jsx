import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetBorrowingsQuery, useReturnBookMutation, useIssueBookMutation } from '../../store/api/circulationApi';
import { useGetBooksQuery } from '../../store/api/booksApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import { 
  Search, Filter, ArrowUpRight, Clock, CheckCircle, AlertCircle, 
  Calendar, Hash, IndianRupee, Plus, X, Book, User as UserIcon, 
  Loader2, ChevronRight 
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
      toast.success('Book issued');
      setIsIssueModalOpen(false);
      reset();
    } catch (err) {}
  };

  const handleReturn = async (id) => {
    try {
      await returnBookMutation(id).unwrap();
      toast.success('Book returned');
    } catch (err) {}
  };

  const setDays = (days) => {
    if (!watchBorrowedDate) return;
    const date = new Date(watchBorrowedDate);
    date.setDate(date.getDate() + days);
    setValue('dueDate', date.toISOString().split('T')[0]);
  };

  const getStatus = (record) => {
    if (record.status === 'returned') return { label: 'Returned', color: 'badge-success' };
    const dueDate = new Date(record.dueDate);
    if (isAfter(new Date(), dueDate)) return { label: 'Late', color: 'badge-danger' };
    return { label: 'Borrowed', color: 'badge-info' };
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) return <tr><td colSpan="9" className="p-8"><LoadingSkeleton type="table" rows={10} /></td></tr>;
    if (error) return <tr><td colSpan="9" className="p-12"><ErrorState message="Error loading borrowings" onRetry={refetch} /></td></tr>;
    if (!items.length) return <tr><td colSpan="9" className="p-12"><EmptyState title="No active borrowings" icon={Clock} /></td></tr>;

    return items.map((record) => {
      const status = getStatus(record);
      return (
        <tr key={record._id}>
          <td className="px-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 border border-slate-100 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${record.user?.fullName || record.user?.name}&size=32&background=random`} alt="" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{record.user?.fullName || record.user?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{record.user?.email}</p>
              </div>
            </div>
          </td>
          <td>
            <p className="text-[13px] font-bold text-slate-900 truncate max-w-[200px]">{record.book?.title}</p>
            <p className="text-[10px] text-slate-400 font-medium">{record.book?.isbn}</p>
          </td>
          <td className="text-center font-medium text-slate-600">
            {record.borrowedDate ? format(new Date(record.borrowedDate), 'dd MMM yy') : '-'}
          </td>
          <td className="text-center font-medium text-rose-500">
            {record.dueDate ? format(new Date(record.dueDate), 'dd MMM yy') : '-'}
          </td>
          <td className="text-center">
            <span className={`text-[12px] font-medium ${record.returnedDate ? 'text-emerald-600' : 'text-slate-300'}`}>
              {record.returnedDate ? format(new Date(record.returnedDate), 'dd MMM yy') : 'Pending'}
            </span>
          </td>
          <td className="text-center">
            <span className={`text-[12px] font-bold ${record.lateDays > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {record.lateDays || 0}d
            </span>
          </td>
          <td className="text-center font-bold text-slate-900">
             ₹{record.fineAmount || 0}
          </td>
          <td>
            <span className={`badge ${status.color} lowercase`}>{status.label}</span>
          </td>
          <td className="px-5 text-right">
            {record.status === 'borrowed' ? (
              <button onClick={() => handleReturn(record._id)} disabled={isReturning} className="btn btn-secondary btn-sm">
                {isReturning ? <Loader2 size={12} className="animate-spin" /> : 'Return'}
              </button>
            ) : (
              <button className="text-slate-300 hover:text-slate-600 p-1"><ArrowUpRight size={16} /></button>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Borrowing History</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Track book circulation and late returns</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
            />
          </div>
          <button onClick={() => setIsIssueModalOpen(true)} className="btn btn-primary btn-md">
            <Plus size={16} />
            <span className="hidden sm:inline ml-1.5">Issue Book</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Member</th>
              <th>Book</th>
              <th className="text-center">Borrowed</th>
              <th className="text-center">Due Date</th>
              <th className="text-center">Returned</th>
              <th className="text-center">Late</th>
              <th className="text-center">Fine</th>
              <th>Status</th>
              <th className="text-right px-5">Action</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {items.length} records</p>
        <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <AnimatePresence>
        {isIssueModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-lg">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Issue New Book Asset</h2>
                <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onIssueSubmit)} className="flex flex-col">
                <div className="modal-b space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">Member</label>
                      <select {...register('userId', { required: true })} className="input">
                        <option value="">Choose member...</option>
                        {users?.map(u => <option key={u._id} value={u._id}>{u.fullName || u.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Book Asset</label>
                      <select {...register('bookId', { required: true })} className="input">
                        <option value="">Choose book...</option>
                        {books?.filter(b => b.availableCopies > 0).map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                    <div className="space-y-1.5">
                      <label className="label">Borrow Date</label>
                      <input {...register('borrowedDate', { required: true })} type="date" className="input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Due Date</label>
                      <input {...register('dueDate', { required: true })} type="date" className="input" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setDays(7)} className="btn btn-secondary btn-sm">7d</button>
                    <button type="button" onClick={() => setDays(14)} className="btn btn-secondary btn-sm">14d</button>
                    <button type="button" onClick={() => setDays(30)} className="btn btn-secondary btn-sm">30d</button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Fine Per Day (₹)</label>
                    <input {...register('finePerDay', { required: true })} type="number" className="input" placeholder="5" />
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsIssueModalOpen(false)} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isIssuing} className="btn btn-primary btn-md px-8 min-w-[120px]">
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
