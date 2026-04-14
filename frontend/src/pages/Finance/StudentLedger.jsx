import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Printer, ArrowLeft, ArrowDownRight, ArrowUpRight, IndianRupee,
  Loader2, PlusCircle, Download, FileText, Receipt, History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useGetStudentAccountQuery,
  useAddPaymentMutation,
  useAddChargeMutation,
  useAddCreditNoteMutation,
  useAddDebitNoteMutation
} from '../../store/api/financeApi';

const StudentLedger = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading: loading } = useGetStudentAccountQuery(studentId);
  const account = data?.data?.account;
  const transactions = data?.data?.transactions || [];

  const [addPayment] = useAddPaymentMutation();
  const [addCharge] = useAddChargeMutation();
  const [addCreditNote] = useAddCreditNoteMutation();
  const [addDebitNote] = useAddDebitNoteMutation();

  const [modal, setModal] = useState(null); // 'payment' | 'charge' | 'credit' | 'debit'
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    description: '',
    category: 'other_income',
    notes: '',
    isFine: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleModalClose = () => {
    setModal(null);
    setFormData({ amount: '', paymentMethod: 'cash', description: '', category: 'other_income', notes: '', isFine: false });
  };

  const handleAction = async (e, mutationFn, successMsg) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mutationFn({ studentId, data: formData }).unwrap();
      toast.success(successMsg);
      handleModalClose();
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  if (!account && !loading) return <div className="p-8 text-center text-slate-500">Account not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/finance/accounts')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Ledger</h1>
            <p className="text-slate-500 font-medium italic">Detailed accounting and transaction history</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all">
            <Printer size={14} /> Print Statement
          </button>
          <div className="h-10 w-px bg-slate-100 mx-2" />
          <div className="flex gap-2">
            <button onClick={() => setModal('credit')} className="bg-sky-50 text-sky-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-100 transition-all">
              Credit Note
            </button>
            <button onClick={() => setModal('charge')} className="bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
              Add Charge
            </button>
            <button onClick={() => setModal('payment')} className="bg-[#044343] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:bg-[#033636] transition-all">
              Receive Payment
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      {account && (
        <div className="bg-[#044343] p-8 rounded-[2.5rem] text-white print:bg-white print:text-black print:border print:border-slate-200 shadow-xl shadow-teal-900/10 transition-all">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center print:bg-slate-100 shrink-0">
                {account.studentId?.profilePicture ? (
                  <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <span className="text-4xl font-black">{account.studentId?.fullName?.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-3xl font-black mb-1 truncate">{account.studentId?.fullName}</h2>
                <div className="flex items-center gap-3 text-teal-100/70 font-bold text-sm print:text-slate-500 mb-4">
                  <span>{account.studentId?.email}</span>
                  <span className="w-1 h-1 rounded-full bg-teal-100/30" />
                  <span>{account.studentId?.phone || 'No Phone'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100">
                    ACC: {account.accountNumber}
                  </span>
                  <span className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest print:bg-slate-100">
                    ID: {account.studentId?.idNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-6">
              <div className="space-y-1">
                <p className="text-teal-100/50 text-[10px] font-black uppercase tracking-widest print:text-slate-400">Total Fees</p>
                <p className="text-xl font-black">{fmt(account.totalCharged)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-teal-100/50 text-[10px] font-black uppercase tracking-widest print:text-slate-400">Total Paid</p>
                <p className="text-xl font-black text-emerald-400 print:text-emerald-600">{fmt(account.totalPaid)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-teal-100/50 text-[10px] font-black uppercase tracking-widest print:text-slate-400">Active Fines</p>
                <p className="text-xl font-black text-amber-400 print:text-amber-600">{fmt(account.totalFines)}</p>
              </div>
              <div className="space-y-1 md:pl-8 md:border-l md:border-white/10 print:border-slate-100">
                <p className="text-teal-100/50 text-[10px] font-black uppercase tracking-widest print:text-slate-400">Current Balance</p>
                <p className={`text-4xl font-black ${account.currentBalance > 0 ? 'text-rose-400 print:text-rose-600' : 'text-white print:text-black'}`}>
                  {fmt(account.currentBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between no-print">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History size={18} className="text-[#044343]" /> Transaction History
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Full audit trail for this account</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-6 py-5">Description / Type</th>
                <th className="px-6 py-5 text-right">Debit (Charge)</th>
                <th className="px-6 py-5 text-right">Credit (Payment)</th>
                <th className="px-8 py-5 text-right">Running Balance</th>
                <th className="px-8 py-5 no-print">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && transactions.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold">Loading entries...</td></tr>
              ) : transactions.map((tx) => (
                <tr key={tx._id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{format(new Date(tx.date), 'hh:mm a')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-slate-900">{tx.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {tx.type.replace('_', ' ')}
                      </span>
                      {tx.paymentMethod !== 'other' && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                          {tx.paymentMethod}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {['fine', 'debit_note', 'adjustment'].includes(tx.type) && tx.amount > 0 ? (
                      <span className="text-rose-500 font-black">+ {fmt(tx.amount)}</span>
                    ) : tx.type === 'income' && tx.category !== 'payment' ? (
                      <span className="text-rose-500 font-black">+ {fmt(tx.amount)}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {tx.type === 'income' && tx.category === 'payment' ? (
                      <span className="text-emerald-500 font-black">- {fmt(tx.amount)}</span>
                    ) : tx.type === 'credit_note' ? (
                      <span className="text-emerald-500 font-black">- {fmt(tx.amount)}</span>
                    ) : '-'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-lg font-black text-slate-900 tracking-tight">{fmt(tx.runningBalance)}</span>
                  </td>
                  <td className="px-8 py-5 no-print">
                    {tx.receiptId && (
                      <button
                        onClick={() => navigate(`/app/finance/receipts/${tx.receiptId}`)}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-[#044343] hover:bg-teal-50 rounded-xl transition-all"
                        title="View Receipt"
                      >
                        <Receipt size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !loading && (
                <tr><td colSpan="6" className="p-20 text-center text-slate-400 font-bold italic">No transactions found for this student.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#044343]" />

              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {modal === 'payment' ? 'Receive Payment' :
                  modal === 'charge' ? 'Add Charge / Fine' :
                    modal === 'credit' ? 'Credit Note' : 'Debit Note'}
              </h2>
              <p className="text-slate-400 font-bold text-sm mb-8 uppercase tracking-widest">
                Student: {account?.studentId?.fullName}
              </p>

              <form className="space-y-6" onSubmit={(e) => {
                if (modal === 'payment') handleAction(e, addPayment, 'Payment recorded successfully');
                else if (modal === 'charge') handleAction(e, addCharge, 'Charge added successfully');
                else if (modal === 'credit') handleAction(e, addCreditNote, 'Credit note issued');
                else if (modal === 'debit') handleAction(e, addDebitNote, 'Debit note issued');
              }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Amount (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input
                        type="number" required min="1" autoFocus
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/10 font-black text-xl text-slate-900"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {modal === 'payment' && (
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/10 font-bold text-slate-900"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI / Online</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="wallet">Wallet</option>
                      </select>
                    </div>
                  )}

                  {modal === 'charge' && (
                    <>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/10 font-bold text-slate-900"
                        >
                          <option value="monthly_fee">Monthly Fee</option>
                          <option value="registration_fee">Registration Fee</option>
                          <option value="membership_fee">Membership Fee</option>
                          <option value="late_fine">Late Return Fine</option>
                          <option value="table_fee">Study Desk Fee</option>
                          <option value="other_income">Other Charge</option>
                        </select>
                      </div>
                      <div className="col-span-1 flex items-end pb-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.isFine}
                            onChange={e => setFormData({ ...formData, isFine: e.target.checked })}
                            className="w-5 h-5 rounded-lg text-[#044343] focus:ring-[#044343]/20"
                          />
                          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Mark as Fine</span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Description</label>
                    <input
                      type="text" required
                      placeholder={modal === 'payment' ? 'e.g. Monthly Fee Payment' : 'e.g. Library Late Fee'}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/10 font-bold text-slate-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Notes (Optional)</label>
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#044343]/10 font-bold text-slate-900 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button" onClick={handleModalClose}
                    className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-transparent"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl flex justify-center items-center gap-2 transition-all ${modal === 'charge' ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600' :
                        modal === 'credit' ? 'bg-sky-500 shadow-sky-500/20 hover:bg-sky-600' :
                          'bg-[#044343] shadow-teal-900/20 hover:bg-[#033636]'
                      }`}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        {modal === 'payment' ? 'Confirm Payment' :
                          modal === 'charge' ? 'Add Charge' :
                            modal === 'credit' ? 'Issue Credit' : 'Issue Debit'}
                      </>
                    )}
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

export default StudentLedger;
