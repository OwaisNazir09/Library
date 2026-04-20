import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Printer, ArrowLeft, ArrowDownRight, ArrowUpRight, IndianRupee,
  Loader2, PlusCircle, Download, FileText, Receipt, History,
  TrendingDown, TrendingUp, Wallet, Landmark, CreditCard, X,
  Filter, Calendar, RefreshCcw, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useGetAccountLedgerQuery,
  useAddPaymentMutation,
  useAddChargeMutation,
  useAddRefundMutation,
  useGetAccountsQuery
} from '../../store/api/financeApi';

const StudentLedger = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: ''
  });

  const { data, isLoading: loading, refetch } = useGetAccountLedgerQuery({
    id: studentId,
    params: { page, ...filters }
  });
  const { data: accountsData } = useGetAccountsQuery();
  
  const account = data?.data?.account;
  const transactions = data?.data?.transactions || [];
  const totalTransactions = data?.data?.totalTransactions || 0;
  const totalPages = data?.data?.pages || 1;
  const accounts = accountsData?.data || [];

  const [addPayment] = useAddPaymentMutation();
  const [addCharge] = useAddChargeMutation();
  const [addRefund] = useAddRefundMutation();

  const [modal, setModal] = useState(null); 
  const [formData, setFormData] = useState({
    amount: '',
    debitAccountId: '',
    creditAccountId: '',
    cashAccountId: '',
    incomeAccountId: '',
    description: '',
    category: 'Membership Income',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const handleModalClose = () => {
    setModal(null);
    setFormData({ amount: '', debitAccountId: '', creditAccountId: '', cashAccountId: '', incomeAccountId: '', description: '', category: 'Membership Income', date: new Date().toISOString().split('T')[0] });
  };

  const handleAction = async (e, mutationFn, successMsg) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mutationFn({ studentId, data: formData }).unwrap();
      toast.success(successMsg);
      handleModalClose();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  if (!account && !loading) return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      <Wallet size={32} className="text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-slate-900">Ledger Not Found</h3>
      <p className="text-slate-500 text-sm mt-1 mb-6">This student might not have a financial account yet.</p>
      <button onClick={() => navigate('/app/finance/student-accounts')} className="btn btn-primary btn-md">
        <ArrowLeft size={16} /> Back to Accounts
      </button>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/finance/student-accounts')}
            className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Ledger</h1>
              <span className="badge badge-neutral lowercase">{account?.accountNumber || 'N/A'}</span>
            </div>
            <p className="text-slate-500 text-xs font-medium">History for <span className="text-slate-900 font-bold">{account?.studentId?.fullName}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
              <Printer size={14} /> Print
            </button>
            <div className="w-px h-6 bg-slate-100 mx-1 hidden lg:block" />
            <button onClick={() => setModal('refund')} className="btn btn-secondary btn-sm text-sky-600">Refund</button>
            <button onClick={() => setModal('charge')} className="btn btn-secondary btn-sm text-rose-600">Charge</button>
            <button onClick={() => setModal('payment')} className="btn btn-primary btn-sm px-4">Receive Payment</button>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                {account?.studentId?.profilePicture ? (
                  <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                    {account?.studentId?.fullName?.charAt(0)}
                  </div>
                )}
             </div>
             <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member</p>
                <p className="text-[13px] font-bold text-slate-900 truncate">{account?.studentId?.fullName}</p>
             </div>
          </div>
          <div className="card">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumulative Fees</p>
            <p className="text-lg font-bold text-rose-500 mt-0.5">{fmt(account?.totalCharged)}</p>
          </div>
          <div className="card">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{fmt(account?.totalPaid)}</p>
          </div>
          <div className="card bg-slate-900 text-white border-none">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Current Balance</p>
            <p className="text-lg font-bold mt-0.5">{fmt(account?.currentBalance)}</p>
          </div>
      </div>

      {/* Filters */}
      <div className="card py-3 px-5 flex flex-wrap items-center gap-4 no-print">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <input type="date" className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          <span className="text-slate-300 font-bold">to</span>
          <input type="date" className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
        </div>
        <select className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option>
          <option value="receipt">Payments</option>
          <option value="fee_charge">Charges</option>
          <option value="fine">Fines</option>
          <option value="refund">Refunds</option>
        </select>
        <button onClick={() => setFilters({startDate: '', endDate: '', type: ''})} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-500 transition-colors ml-auto flex items-center gap-1.5">
          <RefreshCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between no-print">
          <h3 className="text-sm font-bold text-slate-900">Detailed Statement</h3>
          <div className="flex items-center gap-3">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-secondary btn-sm w-8 h-8 p-0 disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm w-8 h-8 p-0 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">Date</th>
              <th className="px-6">Ref / Description</th>
              <th className="px-6 text-right">Debit (+)</th>
              <th className="px-6 text-right">Credit (-)</th>
              <th className="px-6 text-right">Balance</th>
              <th className="px-6 no-print text-center">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 ? (
              <tr><td colSpan="6" className="p-12 text-center text-slate-400 text-sm font-medium animate-pulse">Computing ledger...</td></tr>
            ) : transactions.map((tx) => {
              const isDebit = tx.debitAccountId?._id === account?._id;
              const otherAcc = isDebit ? tx.creditAccountId : tx.debitAccountId;

              return (
                <tr key={tx._id} className={tx.isReversed ? 'opacity-40 grayscale bg-slate-50/20' : ''}>
                  <td className="px-6">
                    <p className="font-bold text-slate-900">{format(new Date(tx.date), 'dd MMM yy')}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{format(new Date(tx.date), 'hh:mm a')}</p>
                  </td>
                  <td className="px-6">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tx.transactionRef || 'N/A'}</span>
                        {tx.isReversed && <span className="text-[8px] font-bold bg-rose-100 text-rose-600 px-1 rounded uppercase">Reversed</span>}
                      </div>
                      <p className="text-[13px] font-bold text-slate-800">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {isDebit ? 'To: ' : 'From: '} {otherAcc?.name || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 text-right font-bold text-rose-500">{isDebit ? `+ ${fmt(tx.amount)}` : ''}</td>
                  <td className="px-6 text-right font-bold text-emerald-600">{!isDebit ? `- ${fmt(tx.amount)}` : ''}</td>
                  <td className="px-6 text-right font-bold text-slate-900">{fmt(tx.runningBalance)}</td>
                  <td className="px-6 text-center no-print">
                    {tx.receiptId && (
                      <button onClick={() => navigate(`/app/finance/receipts/${tx.receiptId}`)} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <Receipt size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Modals handled by index.css modal classes */}
      <AnimatePresence>
        {modal && (
          <div className="modal-wrapper">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="modal-panel w-full max-w-md">
              <div className="modal-h">
                 <h2 className="text-base font-bold capitalize">{modal} Entry</h2>
                 <button onClick={handleModalClose} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>
              <form className="modal-b space-y-4" onSubmit={(e) => {
                if (modal === 'payment') handleAction(e, addPayment, 'Payment recorded');
                else if (modal === 'refund') handleAction(e, addRefund, 'Refund issued');
                else handleAction(e, addCharge, 'Charge recorded');
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Amount (INR)</label>
                    <input type="number" required min="1" className="input h-11 text-lg font-bold" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                  {modal === 'payment' && (
                    <div className="col-span-2">
                      <label className="label">Deposit To (Asset)</label>
                      <select required className="input" value={formData.debitAccountId} onChange={e => setFormData({ ...formData, debitAccountId: e.target.value })}>
                        <option value="">Choose Asset...</option>
                        {accounts.filter(a => a.type === 'Assets' && a.subType !== 'Student Receivable').map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}
                  {modal === 'charge' && (
                    <div className="col-span-2">
                      <label className="label">Credit Account (Income/Liability)</label>
                      <select required className="input" value={formData.creditAccountId} onChange={e => setFormData({ ...formData, creditAccountId: e.target.value })}>
                        <option value="">Choose Account...</option>
                        {accounts.filter(a => a.type === 'Income' || a.type === 'Liabilities').map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="label">Description</label>
                    <input type="text" required className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Date</label>
                    <input type="date" className="input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={submitting} className="btn btn-primary w-full h-11 text-xs font-bold uppercase tracking-wider">
                    {submitting ? 'Processing...' : `Accept ${modal}`}
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
