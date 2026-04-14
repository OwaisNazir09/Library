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
  Loader2
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

  const items = borrowingsData?.data?.borrowings || [];
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
                className="px-4 py-2 bg-[#044343] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#033636] transition-all shadow-md shadow-teal-900/10 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isReturning ? <Loader2 size={12} className="animate-spin" /> : 'Return Book'}
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Library Borrowings</h1>
          <p className="text-slate-500 font-medium italic">Advanced circulation tracking & fine management system.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by member or book..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm transition-all"
            />
          </div>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#044343] text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-900/10 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Issue New Assets
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Member Name</th>
                <th className="px-6 py-5">Book Assets</th>
                <th className="px-6 py-5 text-center">Borrow Date</th>
                <th className="px-6 py-5 text-center">Due Date</th>
                <th className="px-6 py-5 text-center">Return Date</th>
                <th className="px-6 py-5 text-center">Late Days</th>
                <th className="px-6 py-5 text-center">Fine (₹)</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
        
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-xl"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900">Borrow Book Asset</h2>
                <p className="text-slate-500 font-medium mt-1">Configure issuance parameters, return dates, and fine rules.</p>
              </div>

              <form onSubmit={handleSubmit(onIssueSubmit)} className="space-y-10">
                {/* Section 1: Member & Asset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <UserIcon size={14} className="text-[#044343]" /> Select Member (Dropdown)
                    </label>
                    <select
                      {...register('userId', { required: true })}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 font-bold text-sm h-[55px]"
                    >
                      <option value="">Search or choose member...</option>
                      {users?.map(u => (
                        <option key={u._id || u.id} value={u._id || u.id}>{u.fullName || u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Book size={14} className="text-[#044343]" /> Select Book Asset (Availability Checked)
                    </label>
                    <select
                      {...register('bookId', { required: true })}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 font-bold text-sm h-[55px]"
                    >
                      <option value="">Choose available book...</option>
                      {books?.map(b => (
                        <option 
                          key={b._id || b.id} 
                          value={b._id || b.id}
                          disabled={b.availableCopies <= 0}
                        >
                          {b.title} {b.availableCopies <= 0 ? '— (NO AVAILABILITY ❌)' : `— (In Stock: ${b.availableCopies})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: Dates & Fine Settings */}
                <div className="p-8 bg-teal-50/30 rounded-[2rem] border border-teal-100/50 space-y-8">
                   <div className="flex items-center gap-2 mb-2">
                       <span className="w-1.5 h-6 bg-teal-600 rounded-full"></span>
                       <h3 className="text-xs font-black text-teal-800 uppercase tracking-widest">Timeframe & Fine Rules</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">
                          <Calendar size={14} /> Borrow Date
                        </label>
                        <input 
                          {...register('borrowedDate', { required: true })} 
                          type="date" 
                          className="w-full bg-white border border-teal-100 rounded-2xl py-3.5 px-6 font-bold text-teal-900 outline-none h-[55px]" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-rose-700 uppercase tracking-widest ml-1">
                          <Calendar size={14} /> Borrow Until (Due Date)
                        </label>
                        <input 
                          {...register('dueDate', { required: true })} 
                          type="date" 
                          className="w-full bg-white border border-rose-100 rounded-2xl py-3.5 px-6 font-bold text-rose-900 outline-none h-[55px]" 
                        />
                      </div>

                      <div className="md:col-span-2 flex flex-wrap gap-2">
                         <button type="button" onClick={() => setDays(7)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-[#044343] hover:text-[#044343] transition-all">7 Days</button>
                         <button type="button" onClick={() => setDays(14)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-[#044343] hover:text-[#044343] transition-all">14 Days</button>
                         <button type="button" onClick={() => setDays(30)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-[#044343] hover:text-[#044343] transition-all">30 Days</button>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">
                          <IndianRupee size={14} /> Fine Per Day (₹)
                        </label>
                        <div className="relative">
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-teal-600">₹</span>
                           <input 
                            {...register('finePerDay', { required: true })} 
                            type="number" 
                            className="w-full bg-white border border-teal-100 rounded-2xl py-3.5 pl-10 pr-6 font-bold text-teal-900 outline-none h-[55px]" 
                            placeholder="5"
                           />
                        </div>
                        <p className="text-[9px] text-teal-600 font-bold ml-1 uppercase tracking-widest">Applied automatically if returned after due date.</p>
                      </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-400 font-black py-5 rounded-3xl transition-all uppercase tracking-widest text-sm"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isIssuing}
                    className="flex-[2] bg-[#044343] text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isIssuing ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Issuance Logic'}
                    {!isIssuing && <ArrowUpRight size={20} />}
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
