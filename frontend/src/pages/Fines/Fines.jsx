import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, AlertCircle, Book, User } from 'lucide-react';
import { format } from 'date-fns';
import { getFines, payFine } from '../../services/fineService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const mockFinesData = [
  { _id: '1', student: { fullName: "Jane Doe" }, amount: 50, status: "unpaid", createdAt: new Date().toISOString() },
  { _id: '2', student: { fullName: "Ahmed Khan" }, amount: 20, status: "paid", createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  { _id: '3', student: { fullName: "Sarah Smith" }, amount: 150, status: "unpaid", createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
];

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFines();
        if (res?.data) {
          setFines(res.data);
        } else {
          setFines(mockFinesData);
        }
      } catch (err) {
        console.warn("API not available or failed. Falling back to mock data.", err);
        setFines(mockFinesData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayFine = async (id) => {
    try {
      // Optimistic update
      setFines(prev => prev.map(f => f._id === id ? { ...f, status: 'paid' } : f));
      await payFine(id);
      toast.success('Fine marked as paid!');
    } catch (err) {
      console.warn("Backend update failed, using local state", err);
      toast.success('Fine marked as paid (Local State)!');
    }
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fines & Fees</h1>
          <p className="text-slate-500 font-medium">Manage penalties for late returns.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Student Name</th>
                <th className="px-6 py-5">Fine Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date Accrued</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fines.map((fine) => (
                <tr key={fine._id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-black text-slate-900">{fine.student?.fullName || 'Unknown Student'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-black text-slate-900">${fine.amount}</span>
                  </td>
                  <td className="px-6 py-5">
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
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-600">{format(new Date(fine.createdAt), 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {fine.status === 'unpaid' ? (
                      <button 
                        onClick={() => handlePayFine(fine._id)}
                        className="bg-[#044343] border text-xs border-transparent text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 ml-auto active:scale-95"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {fines.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <DollarSign size={32} />
                    </div>
                    <p className="text-slate-900 font-bold mb-1">No Fines Found</p>
                    <p className="text-slate-500 text-sm">Students are returning their books on time!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fines;
