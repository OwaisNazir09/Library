import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Printer, ArrowLeft, ArrowDownRight, ArrowUpRight, IndianRupee, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { fetchStudentLedger, addPayment, addCharge } from '../../store/slices/ledgerSlice';


const LedgerDetail = () => {
  const { studentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentLedger: ledger, currentEntries: entries, loading } = useSelector((state) => state.ledger);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: '', mode: 'cash', description: '', category: 'other' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(() => {
    dispatch(fetchStudentLedger({ studentId }));
  }, [dispatch, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(addPayment({ studentId, data: { amount: formData.amount, paymentMode: formData.mode } })).unwrap();
      toast.success('Payment added successfully');
      setPaymentModalOpen(false);
      setFormData({ amount: '', mode: 'cash', description: '', category: 'other' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCharge = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(addCharge({ studentId, data: { amount: formData.amount, description: formData.description, category: formData.category } })).unwrap();
      toast.success('Charge added successfully');
      setChargeModalOpen(false);
      setFormData({ amount: '', mode: 'cash', description: '', category: 'other' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add charge');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ledger && !loading) {
    return <div className="p-8 text-center text-slate-500">Ledger not found or no access.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/ledger')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Ledger</h1>
            <p className="text-slate-500 font-medium italic">Detailed accounting history</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-300 transition-all"
          >
            <Printer size={16} /> Print Statement
          </button>
          <button 
            onClick={() => setChargeModalOpen(true)}
            className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
          >
            Add Charge
          </button>
          <button 
            onClick={() => setPaymentModalOpen(true)}
            className="flex items-center gap-2 bg-[#044343] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:bg-[#033636] transition-all"
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Student Summary Card */}
      {ledger && (
        <div className="bg-[#044343] p-8 rounded-[2rem] text-white print:bg-white print:text-black print:border print:border-slate-300">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex flex-col items-center justify-center print:bg-slate-100">
                <span className="text-3xl font-black">{ledger.studentId?.fullName?.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-black mb-1">{ledger.studentId?.fullName}</h2>
                <p className="text-teal-100/70 font-medium text-sm print:text-slate-500">{ledger.studentId?.email} • {ledger.studentId?.phone || 'No phone'}</p>
                <div className="mt-3 inline-flex bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest print:bg-slate-100">
                  ID: {ledger.studentId?.idNumber || 'N/A'} • LEDGER: {ledger.ledgerId}
                </div>
              </div>
            </div>
            
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-teal-100/70 text-xs font-bold uppercase tracking-widest print:text-slate-500">Total Fees</p>
                <p className="text-xl font-black mt-1">₹{ledger.totalFee}</p>
              </div>
              <div className="text-right">
                <p className="text-teal-100/70 text-xs font-bold uppercase tracking-widest print:text-slate-500">Total Paid</p>
                <p className="text-xl font-black mt-1 text-emerald-400 print:text-emerald-600">₹{ledger.totalPaid}</p>
              </div>
              <div className="text-right pl-8 border-l border-white/20 print:border-slate-200">
                <p className="text-teal-100/70 text-xs font-bold uppercase tracking-widest print:text-slate-500">Current Balance</p>
                <p className={`text-3xl font-black mt-1 ${ledger.balance > 0 ? 'text-rose-400 print:text-rose-600' : 'text-white print:text-black'}`}>
                  ₹{ledger.balance}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5 text-right">Debit (₹)</th>
                <th className="px-6 py-5 text-right">Credit (₹)</th>
                <th className="px-8 py-5 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && entries.length === 0 ? (
                <tr>
                   <td colSpan="5" className="p-8 text-center text-slate-400">Loading ledger...</td>
                </tr>
              ) : entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-slate-900">
                    {format(new Date(entry.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-slate-900">{entry.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{entry.paymentMode}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {entry.type === 'debit' ? (
                      <span className="text-rose-500 font-black">+ {entry.amount}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {entry.type === 'credit' ? (
                       <span className="text-emerald-500 font-black">- {entry.amount}</span>
                    ) : '-'}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 text-lg">
                    {entry.runningBalance}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && !loading && (
                 <tr>
                   <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold">No entries found for this ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Receive Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Amount (₹)</label>
                <div className="relative mt-1">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/20 font-black text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Payment Mode</label>
                <select
                  value={formData.mode}
                  onChange={e => setFormData({...formData, mode: e.target.value})}
                  className="w-full mt-1 px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/20 font-bold text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-[2] bg-[#044343] text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:bg-[#033636] transition-all disabled:opacity-70 flex justify-center"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Charge Modal */}
      {chargeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Add Charge (Debit)</h2>
            <form onSubmit={handleCharge} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Return Fine"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full mt-1 px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/20 font-bold text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full mt-1 px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/20 font-bold text-sm"
                  >
                    <option value="late_fine">Late Fine</option>
                    <option value="monthly_fee">Monthly Fee</option>
                    <option value="admission_fee">Admission Fee</option>
                    <option value="security_deposit">Security Deposit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full mt-1 px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/20 font-black text-lg text-rose-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setChargeModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-[2] bg-rose-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-70 flex justify-center"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Add Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerDetail;
