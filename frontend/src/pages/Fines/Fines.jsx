import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IndianRupeeIcon, CheckCircle2, AlertCircle, User, Search, IndianRupee, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { getFines, payFine } from '../../services/fineService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [payingId, setPayingId] = useState(null);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFines({ page: currentPage, limit, search: searchTerm });
      if (res?.data) {
        setFines(res.data.fines || res.data);
        setTotal(res.total || res.results || 0);
      }
    } catch (err) {
      toast.error("Failed to load fines.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePayFine = async (id) => {
    try {
      await payFine(id);
      setFines(prev => prev.map(f => f._id === id ? { ...f, status: 'paid' } : f));
      toast.success('Fine paid');
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Penalties & Fines</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage overdue charges and member penalties</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Student</th>
              <th className="text-center">Fine Amount</th>
              <th className="text-center">Status</th>
              <th className="text-center">Date Accrued</th>
              <th className="text-right px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && fines.length === 0 ? (
              <tr><td colSpan="5" className="p-8"><LoadingSkeleton type="table" rows={10} /></td></tr>
            ) : (
              fines.map((fine) => (
                <tr key={fine._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-[11px] border border-slate-100">
                        {fine.student?.fullName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{fine.student?.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{fine.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center font-bold text-[14px] text-slate-900">₹{fine.amount}</td>
                  <td className="text-center">
                    <span className={`badge ${fine.status === 'paid' ? 'badge-success' : 'badge-danger'} lowercase`}>
                      {fine.status}
                    </span>
                  </td>
                  <td className="text-center text-[12px] font-medium text-slate-500">
                    {fine.createdAt ? format(new Date(fine.createdAt), 'dd MMM yyyy') : '-'}
                  </td>
                  <td className="px-5 text-right">
                    {fine.status === 'unpaid' ? (
                      <button onClick={() => { setPayingId(fine._id); handlePayFine(fine._id); }} disabled={payingId === fine._id} className="btn btn-primary btn-sm px-4">
                        {payingId === fine._id ? <Loader2 size={12} className="animate-spin" /> : 'Mark Paid'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))
            )}
            {!loading && fines.length === 0 && (
              <tr><td colSpan="5" className="p-20 text-center text-slate-400 text-xs italic">No active fines found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {fines.length} records</p>
        <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default Fines;
