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
      const res = await getFines({
        page: currentPage,
        limit,
        search: searchTerm
      });
      if (res?.data) {
        setFines(res.data.fines || res.data);
        setTotal(res.total || res.results || 0);
      }
    } catch (err) {
      console.warn("API fail.", err);
      toast.error("Failed to load fines.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayFine = async (id) => {
    try {
      await payFine(id);
      setFines(prev => prev.map(f => f._id === id ? { ...f, status: 'paid' } : f));
      toast.success('Fine marked as paid!');
    } catch (err) {
      console.warn("Return fail", err);
      toast.error('Failed to mark fine as paid.');
    } finally {
      setPayingId(null);
    }
  };

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            <span>Finance</span>
            <ChevronRight size={12} />
            <span className="text-[#044343]">Fines</span>
          </div>
          <h1>Fines & Fees</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={onSearchChange}
              className="input-field pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="compact-table-container">
        <table className="compact-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th className="text-center">Fine Amount</th>
              <th className="text-center">Status</th>
              <th className="text-center">Date Accrued</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && fines.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8">
                  <LoadingSkeleton type="table" rows={5} />
                </td>
              </tr>
            ) : fines.map((fine) => (
              <tr key={fine._id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden font-black">
                      {fine.student?.fullName?.charAt(0) || <User size={18} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 leading-tight">{fine.student?.fullName || 'Unknown Student'}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fine.student?.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-1 font-black text-slate-900">
                    <IndianRupee size={14} className="text-slate-400" />
                    <span className="text-lg tracking-tight">{fine.amount}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {fine.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={10} /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-600">
                      <AlertCircle size={10} /> Unpaid
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">
                  {fine.createdAt ? format(new Date(fine.createdAt), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="px-8 py-5 text-right">
                  {fine.status === 'unpaid' ? (
                    <button
                      onClick={() => {
                        setPayingId(fine._id);
                        handlePayFine(fine._id);
                      }}
                      disabled={payingId === fine._id}
                      className="btn btn-sm btn-primary"
                    >
                      {payingId === fine._id ? <Loader2 size={12} className="animate-spin" /> : 'Mark as Paid'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Resolved</span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && fines.length === 0 && (
              <tr>
                <td colSpan="5" className="px-8 py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <IndianRupee size={32} />
                  </div>
                  <p className="text-slate-900 font-black tracking-tight text-lg">No Penalties Found</p>
                  <p className="text-slate-400 font-bold text-sm">Members are keeping the library rules perfectly!</p>
                </td>
              </tr>
            )}
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
    </div>
  );
};

export default Fines;
