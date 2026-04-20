import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, RefreshCcw, TrendingUp, TrendingDown, 
  ArrowRight, Landmark, Wallet, AlertCircle, Loader2,
  Tag, Calendar, FileText
} from 'lucide-react';
import { 
  useGetAccountsQuery, 
  useAddTransactionMutation,
  useAddTransferMutation,
  useAddJournalEntryMutation,
  useAddExpenseMutation
} from '../../store/api/financeApi';
import { toast } from 'react-hot-toast';

const UniversalTransactionModal = ({ isOpen, onClose, initialType = 'journal' }) => {
  const { data: accountsData } = useGetAccountsQuery();
  const accounts = accountsData?.data || [];

  const [type, setType] = useState(initialType);
  const [formData, setFormData] = useState({
    debitAccountId: '',
    creditAccountId: '',
    amount: '',
    description: '',
    reference: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setType(initialType);
    setFormData(prev => ({ 
      ...prev, 
      debitAccountId: '', 
      creditAccountId: '', 
      amount: '', 
      description: '', 
      category: initialType === 'expense' ? 'Operating Expense' : '' 
    }));
  }, [initialType, isOpen]);

  const [addTransaction, { isLoading: isTrxSubmitting }] = useAddTransactionMutation();
  const [addTransfer, { isLoading: isTransferSubmitting }] = useAddTransferMutation();
  const [addJournal, { isLoading: isJournalSubmitting }] = useAddJournalEntryMutation();
  const [addExpense, { isLoading: isExpenseSubmitting }] = useAddExpenseMutation();

  const isSubmitting = isTrxSubmitting || isTransferSubmitting || isJournalSubmitting || isExpenseSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.debitAccountId === formData.creditAccountId) {
      return toast.error('Debit and Credit accounts must be different');
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (type === 'transfer') {
        await addTransfer({
          amount: payload.amount,
          fromAccountId: payload.creditAccountId,
          toAccountId: payload.debitAccountId,
          description: payload.description,
          reference: payload.reference,
          date: payload.date
        }).unwrap();
      } else if (type === 'journal') {
        await addJournal(payload).unwrap();
      } else if (type === 'expense') {
        await addExpense({
          amount: payload.amount,
          expenseAccountId: payload.debitAccountId,
          cashAccountId: payload.creditAccountId,
          description: payload.description,
          notes: payload.reference,
          category: payload.category,
          date: payload.date
        }).unwrap();
      } else {
        await addTransaction({ ...payload, type: 'income' }).unwrap();
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} recorded successfully`);
      onClose();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to record transaction');
    }
  };

  if (!isOpen) return null;

  const filteredDebitAccounts = accounts.filter(acc => {
    if (type === 'expense') return acc.type === 'Expenses';
    if (type === 'income') return acc.type === 'Assets';
    if (type === 'transfer') return acc.type === 'Assets';
    return true; // journal
  });

  const filteredCreditAccounts = accounts.filter(acc => {
    if (type === 'expense') return acc.type === 'Assets';
    if (type === 'income') return acc.type === 'Income';
    if (type === 'transfer') return acc.type === 'Assets';
    return true; // journal
  });

  const categories = [
    'Operating Expense', 'Direct Expense', 'Rent', 'Salary', 
    'Electricity', 'Maintenance', 'Internet', 'Marketing', 'Other'
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden"
      >
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${
              type === 'expense' ? 'bg-rose-50 text-rose-500' :
              type === 'income' ? 'bg-emerald-50 text-emerald-500' :
              type === 'transfer' ? 'bg-sky-50 text-sky-500' : 'bg-indigo-50 text-indigo-500'
            }`}>
              {type === 'expense' ? <TrendingDown size={20} /> :
               type === 'income' ? <TrendingUp size={20} /> :
               type === 'transfer' ? <RefreshCcw size={20} /> : <ArrowRight size={20} />}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight capitalize">{type} Entry</h2>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Double Entry Ledger</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative">
            <div className="absolute top-[48px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10 hidden md:flex">
              <ArrowRight size={14} className="text-slate-300" />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {type === 'expense' ? 'Expense Account (DR)' : 
                 type === 'income' ? 'Cash/Bank Account (DR)' : 
                 type === 'transfer' ? 'Destination (DR)' : 'Debit Account'}
              </label>
              <select
                required
                className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                value={formData.debitAccountId}
                onChange={e => setFormData({ ...formData, debitAccountId: e.target.value })}
              >
                <option value="">Select Account</option>
                {filteredDebitAccounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.currentBalance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:text-right block">
                {type === 'expense' ? 'Source Asset (CR)' : 
                 type === 'income' ? 'Income Account (CR)' : 
                 type === 'transfer' ? 'Source Asset (CR)' : 'Credit Account'}
              </label>
              <select
                required
                className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all md:text-right"
                value={formData.creditAccountId}
                onChange={e => setFormData({ ...formData, creditAccountId: e.target.value })}
              >
                <option value="">Select Account</option>
                {filteredCreditAccounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.currentBalance.toLocaleString()})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                <input
                  required
                  type="number" min="1" step="0.01"
                  placeholder="0.00"
                  className="w-full h-12 md:h-14 pl-9 md:pl-10 pr-4 md:pr-5 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {type === 'expense' ? 'Expense Category' : 'Transaction Category'}
              </label>
              <div className="relative">
                <Tag className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <select
                  className="w-full h-12 md:h-14 pl-11 md:pl-12 pr-4 md:pr-5 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">General</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                required
                type="text"
                placeholder="What is this transaction for?"
                className="w-full h-12 md:h-14 pl-11 md:pl-12 px-4 md:px-5 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref / Invoice #</label>
              <input
                type="text"
                placeholder="External reference"
                className="w-full h-11 md:h-12 px-4 md:px-5 rounded-xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effective Date</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                <input
                  type="date"
                  className="w-full h-11 md:h-12 px-4 md:px-5 rounded-xl bg-slate-50 border border-slate-100 text-xs md:text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 md:pt-6 flex flex-col-reverse md:flex-row gap-3 md:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full md:flex-[2] h-12 md:h-14 bg-[#044343] text-white rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#033636] transition-all shadow-xl shadow-teal-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {isSubmitting ? 'Recording...' : `Commit ${type} Entry`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UniversalTransactionModal;
