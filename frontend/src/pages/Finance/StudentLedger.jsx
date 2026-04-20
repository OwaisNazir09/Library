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

  const [modal, setModal] = useState(null); // 'payment' | 'charge' | 'refund'
  const [formData, setFormData] = useState({
    amount: '',
    debitAccountId: '',
    creditAccountId: '',
    cashAccountId: '', // for refund
    incomeAccountId: '', // for refund
    description: '',
    category: 'Membership Income',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const handleModalClose = () => {
    setModal(null);
    setFormData({ 
      amount: '', 
      debitAccountId: '', 
      creditAccountId: '', 
      cashAccountId: '',
      incomeAccountId: '',
      description: '', 
      category: 'Membership Income', 
      date: new Date().toISOString().split('T')[0] 
    });
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

  const exportCSV = () => {
    if (!transactions.length) return;
    const headers = ['Date', 'Reference', 'Description', 'Type', 'Debit', 'Credit', 'Balance'];
    const rows = transactions.map(tx => {
      const isDebit = tx.debitAccountId?._id === account?._id;
      return [
        format(new Date(tx.date), 'dd/MM/yyyy'),
        tx.transactionRef || '',
        tx.description,
        tx.type,
        isDebit ? tx.amount : '',
        !isDebit ? tx.amount : '',
        tx.runningBalance
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ledger_${account?.studentId?.fullName}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (!account && !loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm mb-6">
        <Wallet size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ledger Not Found</h3>
      <p className="text-slate-400 font-medium mt-2 mb-8">This student might not have a financial account yet.</p>
      <button 
        onClick={() => navigate('/app/finance/student-accounts')}
        className="flex items-center gap-2 bg-[#044343] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-900/10"
      >
        <ArrowLeft size={16} /> Back to Accounts
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/app/finance/student-accounts')}
            className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#044343] hover:bg-teal-50 shadow-sm transition-all group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Ledger</h1>
              <span className="px-3 py-1 bg-teal-50 text-[#044343] rounded-lg text-[10px] font-black uppercase tracking-widest">
                ACT-ID: {account?.accountNumber || 'N/A'}
              </span>
            </div>
            <p className="text-slate-500 font-medium mt-1">Full financial history for <span className="text-[#044343] font-bold">{account?.studentId?.fullName}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#044343] transition-all shadow-sm">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#044343] transition-all shadow-sm">
              <Printer size={16} /> Print Records
            </button>
            <div className="w-px h-10 bg-slate-100 mx-2 hidden lg:block" />
            <button onClick={() => setModal('refund')} className="bg-sky-50 text-sky-700 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-100 transition-all border border-sky-100">
              Issue Refund
            </button>
            <button onClick={() => setModal('charge')} className="bg-rose-50 text-rose-700 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">
              Add Fee
            </button>
            <button onClick={() => setModal('payment')} className="bg-[#044343] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:bg-[#033636] transition-all">
              Receive Payment
            </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 no-print">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-slate-400" />
          <input 
            type="date" 
            className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-[#044343]"
            value={filters.startDate}
            onChange={e => setFilters({...filters, startDate: e.target.value})}
          />
          <span className="text-slate-300 font-bold">to</span>
          <input 
            type="date" 
            className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-[#044343]"
            value={filters.endDate}
            onChange={e => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-[#044343]"
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="receipt">Payments</option>
            <option value="fee_charge">Charges</option>
            <option value="fine">Fines</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
        <button 
          onClick={() => setFilters({startDate: '', endDate: '', type: ''})}
          className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
        >
          <RefreshCcw size={14} /> Reset Filters
        </button>
      </div>

      {/* Account Info Stats */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 overflow-hidden ring-4 ring-slate-50/50">
                  {account.studentId?.profilePicture ? (
                    <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#044343] font-black text-2xl">
                      {account.studentId?.fullName?.charAt(0)}
                    </div>
                  )}
               </div>
               <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate">{account.studentId?.fullName}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{account.studentId?.email}</p>
               </div>
            </div>
            <div className="flex gap-2">
              <span className="flex-1 bg-slate-50 px-3 py-2 rounded-xl text-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                ID: {account.studentId?.idNumber || 'N/A'}
              </span>
              <span className="flex-1 bg-slate-50 px-3 py-2 rounded-xl text-center text-[9px] font-black uppercase tracking-widest text-[#044343]">
                {account.status}
              </span>
            </div>
          </div>

          {[
            { label: 'Cumulative Fees', value: fmt(account.totalCharged), icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Total Paid', value: fmt(account.totalPaid), icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Current Balance', value: fmt(account.currentBalance), icon: Wallet, color: account.currentBalance > 0 ? 'text-rose-600' : 'text-slate-900', bg: account.currentBalance > 0 ? 'bg-rose-50/50' : 'bg-slate-50', large: true },
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between ${stat.large ? 'ring-2 ring-slate-900/5' : ''}`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className={`text-3xl font-black mt-1 tracking-tight ${stat.color}`}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ledger Entries */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between no-print">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Detailed Statement</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Full financial history and running balance</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-10 py-5">Date</th>
                <th className="px-6 py-5">Ref / Details</th>
                <th className="px-6 py-5 text-right">Debit (+)</th>
                <th className="px-6 py-5 text-right">Credit (-)</th>
                <th className="px-10 py-5 text-right">Balance</th>
                <th className="px-10 py-5 no-print text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && transactions.length === 0 ? (
                <tr><td colSpan="6" className="p-16 text-center text-slate-300 animate-pulse font-black uppercase tracking-widest">Calculating ledger...</td></tr>
              ) : transactions.map((tx) => {
                const isDebit = tx.debitAccountId?._id === account?._id;
                const otherAcc = isDebit ? tx.creditAccountId : tx.debitAccountId;

                return (
                  <tr key={tx._id} className={`group transition-all ${tx.isReversed ? 'opacity-40 grayscale bg-slate-50/30' : 'hover:bg-slate-50/40'}`}>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(tx.date), 'hh:mm a')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.transactionRef || 'N/A'}</span>
                          {tx.isReversed && <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase">Reversed</span>}
                        </div>
                        <span className="text-sm font-black text-slate-800 leading-tight">{tx.description}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-500`}>
                            {tx.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {isDebit ? 'To: ' : 'From: '} {otherAcc?.name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      {isDebit ? (
                        <span className="text-sm font-black text-rose-500 uppercase tracking-tighter">+ {fmt(tx.amount)}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-6 text-right">
                      {!isDebit ? (
                        <span className="text-sm font-black text-emerald-500 uppercase tracking-tighter">- {fmt(tx.amount)}</span>
                      ) : '-'}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-base font-black text-slate-900 tracking-tight">{fmt(tx.runningBalance)}</span>
                    </td>
                    <td className="px-10 py-6 no-print text-center">
                      {tx.receiptId && (
                        <button
                          onClick={() => navigate(`/app/finance/receipts/${tx.receiptId}`)}
                          className="w-10 h-10 inline-flex items-center justify-center bg-slate-50 text-slate-400 hover:text-[#044343] hover:bg-teal-50 rounded-xl transition-all shadow-sm"
                        >
                          <Receipt size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && !loading && (
                <tr><td colSpan="6" className="p-32 text-center text-slate-300 font-bold italic">No records found for the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-[#044343]" />
              <button onClick={handleModalClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                 <X size={28} />
              </button>

              <div className="flex items-center gap-5 mb-10">
                 <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-slate-50 ${
                    modal === 'payment' ? 'text-emerald-500' : modal === 'refund' ? 'text-sky-500' : 'text-rose-500'
                 }`}>
                    {modal === 'payment' ? <TrendingUp size={32} /> : modal === 'refund' ? <RefreshCcw size={32} /> : <TrendingDown size={32} />}
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {modal === 'payment' ? 'Receive Payment' : modal === 'refund' ? 'Issue Refund' : 'Add Fee Charge'}
                    </h2>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mt-1">
                        {account?.name} · {account?.studentId?.fullName}
                    </p>
                 </div>
              </div>

              <form className="space-y-6" onSubmit={(e) => {
                if (modal === 'payment') handleAction(e, addPayment, 'Payment recorded successfully');
                else if (modal === 'refund') handleAction(e, addRefund, 'Refund issued successfully');
                else handleAction(e, addCharge, 'Charge added successfully');
              }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Amount (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input
                        type="number" required min="1" autoFocus
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-[#044343]/5 font-black text-2xl text-slate-900 placeholder:text-slate-200 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {modal === 'payment' && (
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Deposit To (Asset)</label>
                      <select
                        required
                        value={formData.debitAccountId}
                        onChange={e => setFormData({ ...formData, debitAccountId: e.target.value })}
                        className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-[#044343]/5 font-bold text-slate-900 appearance-none transition-all"
                      >
                        <option value="">Choose Asset...</option>
                        {accounts.filter(a => a.type === 'Assets' && a.subType !== 'Student Receivable').map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}

                  {modal === 'charge' && (
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Credit Account (Income)</label>
                      <select
                        required
                        value={formData.creditAccountId}
                        onChange={e => setFormData({ ...formData, creditAccountId: e.target.value })}
                        className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-rose-500/5 font-bold text-slate-900 appearance-none"
                      >
                        <option value="">Choose Income...</option>
                        {accounts.filter(a => a.type === 'Income' || a.type === 'Liabilities').map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                  )}

                  {modal === 'refund' && (
                    <>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Refund From (Asset)</label>
                        <select
                          required
                          value={formData.cashAccountId}
                          onChange={e => setFormData({ ...formData, cashAccountId: e.target.value })}
                          className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-500/5 font-bold text-slate-900 appearance-none"
                        >
                          <option value="">Choose Cash/Bank...</option>
                          {accounts.filter(a => a.type === 'Assets' && a.subType !== 'Student Receivable').map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Debit Account (Income/Liability)</label>
                        <select
                          required
                          value={formData.incomeAccountId}
                          onChange={e => setFormData({ ...formData, incomeAccountId: e.target.value })}
                          className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-500/5 font-bold text-slate-900 appearance-none"
                        >
                          <option value="">Adjust Against...</option>
                          {accounts.filter(a => a.type === 'Income' || a.type === 'Liabilities').map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Description</label>
                    <input
                      type="text" required
                      placeholder="e.g. Monthly Fee April 2024"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-[#044343]/5 font-bold text-slate-900 placeholder:text-slate-300 transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Transaction Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-[#044343]/5 font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit" disabled={submitting}
                    className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-white shadow-2xl flex justify-center items-center gap-3 transition-all ${
                       modal === 'charge' ? 'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600' :
                       modal === 'refund' ? 'bg-sky-500 shadow-sky-500/30 hover:bg-sky-600' :
                       'bg-[#044343] shadow-teal-900/30 hover:bg-[#033636]'
                    }`}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={24} /> : (
                      <>
                        <PlusCircle size={20} />
                        {modal === 'payment' ? 'Complete Receipt' : modal === 'refund' ? 'Process Refund' : 'Record Charge'}
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
