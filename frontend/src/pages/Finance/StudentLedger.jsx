import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, ArrowDownRight, ArrowUpRight, IndianRupee,
  Loader2, PlusCircle, Download, FileText, Receipt, History,
  TrendingDown, TrendingUp, Wallet, Landmark, CreditCard, X,
  Filter, Calendar, RefreshCcw, Search, ChevronLeft, ChevronRight, Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CustomSelect from '../../components/ui/CustomSelect';

import {
  useGetAccountLedgerQuery,
  useAddPaymentMutation,
  useAddChargeMutation,
  useAddRefundMutation,
  useSendLedgerWhatsAppMutation,
  useGetAccountsQuery
} from '../../store/api/financeApi';

const StudentLedger = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

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
  const [sendWhatsApp] = useSendLedgerWhatsAppMutation();

  const handleSendWhatsApp = async () => {
    try {
      toast.loading('Sending Ledger via WhatsApp...', { id: 'wa-ledger' });
      await sendWhatsApp(studentId).unwrap();
      toast.success('Ledger sent successfully!', { id: 'wa-ledger' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send WhatsApp', { id: 'wa-ledger' });
    }
  };

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(4, 67, 67); l
    doc.text(account?.tenantId?.name || 'Library Ledger', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Account: ${account?.accountNumber || 'N/A'}`, 14, 30);
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, pageWidth - 14, 30, { align: 'right' });

    // Student Info
    doc.setDrawColor(230);
    doc.line(14, 35, pageWidth - 14, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Member: ${account?.studentId?.fullName}`, 14, 45);
    doc.setFontSize(10);
    doc.text(`ID: ${account?.studentId?.idNumber || 'N/A'}`, 14, 50);
    doc.text(`Phone: ${account?.studentId?.phone || 'N/A'}`, 14, 55);

    // Summary
    doc.setFillColor(248, 250, 252);
    doc.rect(pageWidth - 80, 40, 66, 25, 'F');
    doc.setFontSize(9);
    doc.text('Balance Status', pageWidth - 76, 46);
    doc.setFontSize(14);
    doc.text(fmt(account?.currentBalance), pageWidth - 76, 56);

    const tableData = transactions.map(tx => {
      const isDebit = tx.debitAccountId?._id === account?._id;
      return [
        format(new Date(tx.date), 'dd/MM/yy'),
        tx.description,
        isDebit ? fmt(tx.amount) : '',
        !isDebit ? fmt(tx.amount) : '',
        fmt(tx.runningBalance)
      ];
    });

    doc.autoTable({
      startY: 70,
      head: [['Date', 'Description', 'Debit (+)', 'Credit (-)', 'Balance']],
      body: tableData,
      headStyles: { fillColor: [4, 67, 67] },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    doc.save(`Ledger_${account?.studentId?.fullName}.pdf`);
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
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {account?.studentId ? 'Student Ledger' : 'Account Ledger'}
              </h1>
              <span className="badge badge-neutral lowercase">{account?.accountNumber || 'N/A'}</span>
            </div>
            <p className="text-slate-500 text-xs font-medium">
              History for <span className="text-slate-900 font-bold">
                {account?.studentId?.fullName || account?.name || 'Account'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleDownloadPDF} className="btn btn-secondary btn-sm">
            <Download size={14} /> PDF
          </button>
          {account?.studentId && (
            <>
              <button onClick={handleSendWhatsApp} className="btn btn-secondary btn-sm text-emerald-600">
                <Receipt size={14} /> Send WhatsApp
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1 hidden lg:block" />
              <button onClick={() => setModal('payment')} className="btn btn-primary btn-sm px-4">Receive Payment</button>
            </>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
            {account?.studentId?.profilePicture ? (
              <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              (account?.studentId?.fullName || account?.name)?.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {account?.studentId ? 'Member' : 'Account'}
            </p>
            <p className="text-[13px] font-bold text-slate-900 truncate">
              {account?.studentId?.fullName || account?.name}
            </p>
            {account?.subType && (
              <p className="text-[10px] text-slate-400">{account.type} · {account.subType}</p>
            )}
          </div>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {account?.studentId ? 'Cumulative Fees' : 'Total Debits'}
          </p>
          <p className="text-lg font-bold text-rose-500 mt-0.5">{fmt(account?.totalCharged)}</p>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {account?.studentId ? 'Total Paid' : 'Total Credits'}
          </p>
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
          <input type="date" className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          <span className="text-slate-300 font-bold">to</span>
          <input type="date" className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        <select className="input h-8 px-2 w-32 border-none bg-slate-50 focus:bg-white" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="receipt">Payments</option>
          <option value="fee_charge">Charges</option>
          <option value="fine">Fines</option>
          <option value="refund">Refunds</option>
        </select>
        <button onClick={() => setFilters({ startDate: '', endDate: '', type: '' })} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-500 transition-colors ml-auto flex items-center gap-1.5">
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
          <div className="modal-wrapper items-start pt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="modal-panel w-full max-w-md mb-20">
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
                      <CustomSelect
                        required
                        placeholder="Choose Asset..."
                        value={formData.debitAccountId}
                        onChange={(v) => setFormData({ ...formData, debitAccountId: v })}
                        options={accounts
                          .filter(a => a.type === 'Assets' && a.subType !== 'Student Receivable')
                          .map(a => ({ value: a._id, label: a.name }))}
                      />
                    </div>
                  )}
                  {modal === 'charge' && (
                    <div className="col-span-2">
                      <label className="label">Credit Account (Income/Liability)</label>
                      <CustomSelect
                        required
                        placeholder="Choose Account..."
                        value={formData.creditAccountId}
                        onChange={(v) => setFormData({ ...formData, creditAccountId: v })}
                        options={accounts
                          .filter(a => a.type === 'Income' || a.type === 'Liabilities')
                          .map(a => ({ value: a._id, label: a.name }))}
                      />
                    </div>
                  )}
                  {modal === 'refund' && (
                    <>
                      <div className="col-span-2">
                        <label className="label text-rose-500 font-bold">Refund From (Asset)</label>
                        <CustomSelect
                          required
                          placeholder="Choose Cash/Bank..."
                          value={formData.cashAccountId}
                          onChange={(v) => setFormData({ ...formData, cashAccountId: v })}
                          options={accounts
                            .filter(a => a.type === 'Assets' && a.subType !== 'Student Receivable')
                            .map(a => ({ value: a._id, label: a.name }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Reverse Income Account</label>
                        <CustomSelect
                          required
                          placeholder="Choose Income..."
                          value={formData.incomeAccountId}
                          onChange={(v) => setFormData({ ...formData, incomeAccountId: v })}
                          options={accounts
                            .filter(a => a.type === 'Income')
                            .map(a => ({ value: a._id, label: a.name }))}
                        />
                      </div>
                    </>
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
