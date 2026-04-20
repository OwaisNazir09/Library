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
    <div className="modal-wrapper">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="modal-panel w-full max-w-xl"
      >
        <div className="modal-h bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === 'expense' ? 'bg-rose-50 text-rose-500' :
              type === 'income' ? 'bg-emerald-50 text-emerald-500' :
              type === 'transfer' ? 'bg-sky-50 text-sky-500' : 'bg-indigo-50 text-indigo-500'
            }`}>
              {type === 'expense' ? <TrendingDown size={16} /> :
               type === 'income' ? <TrendingUp size={16} /> :
               type === 'transfer' ? <RefreshCcw size={16} /> : <ArrowRight size={16} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 capitalize">{type} Entry</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-b space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div className="space-y-1.5">
              <label className="label">
                {type === 'expense' ? 'Expense Account (DR)' : 
                 type === 'income' ? 'Cash/Bank Account (DR)' : 
                 type === 'transfer' ? 'Destination (DR)' : 'Debit Account'}
              </label>
              <select required className="input" value={formData.debitAccountId} onChange={e => setFormData({ ...formData, debitAccountId: e.target.value })}>
                <option value="">Select Account</option>
                {filteredDebitAccounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.currentBalance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="label">
                {type === 'expense' ? 'Source Asset (CR)' : 
                 type === 'income' ? 'Income Account (CR)' : 
                 type === 'transfer' ? 'Source Asset (CR)' : 'Credit Account'}
              </label>
              <select required className="input" value={formData.creditAccountId} onChange={e => setFormData({ ...formData, creditAccountId: e.target.value })}>
                <option value="">Select Account</option>
                {filteredCreditAccounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.name} (₹{acc.currentBalance.toLocaleString()})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">Amount (INR)</label>
              <input required type="number" min="1" step="0.01" className="input font-bold" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
            </div>

            <div className="space-y-1.5">
              <label className="label">Category</label>
              <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">General</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label">Description</label>
            <input required type="text" className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What is this for?" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">Ref / Invoice #</label>
              <input type="text" className="input" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="Optional" />
            </div>

            <div className="space-y-1.5">
              <label className="label">Effective Date</label>
              <input type="date" className="input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
          </div>
        </form>
        
        <div className="modal-f">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-md font-semibold px-6">Cancel</button>
          <button disabled={isSubmitting} type="submit" onClick={handleSubmit} className="btn btn-primary btn-md font-semibold px-6 min-w-[120px]">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Commit Entry'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UniversalTransactionModal;
