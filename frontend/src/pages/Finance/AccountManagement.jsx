import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Landmark, Wallet, TrendingUp, 
  TrendingDown, Users, ChevronRight, ChevronDown, 
  MoreVertical, Edit2, Trash2, Home
} from 'lucide-react';
import { useGetAccountsQuery, useAddAccountMutation } from '../../store/api/financeApi';
import { toast } from 'react-hot-toast';

const TYPES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];
const SUB_TYPES = {
  Assets: ['Cash', 'Bank', 'UPI', 'Wallet', 'Student Receivable', 'Other Receivable'],
  Liabilities: ['Deposit', 'Payable'],
  Income: ['Operating Income', 'Other Income'],
  Expenses: ['Operating Expense', 'Direct Expense'],
  Equity: ['Capital', 'Retained Earnings']
};

const AccountManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: accountsData, isLoading } = useGetAccountsQuery();
  const accounts = accountsData?.data || [];

  const [formData, setFormData] = useState({
    name: '',
    type: 'Assets',
    subType: 'Cash',
    parentAccount: '',
    openingBalance: '',
    description: ''
  });

  const [addAccount, { isLoading: isAdding }] = useAddAccountMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAccount({
        ...formData,
        openingBalance: Number(formData.openingBalance) || 0,
        parentAccount: formData.parentAccount || null
      }).unwrap();
      toast.success('Account created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', type: 'Assets', subType: 'Cash', parentAccount: '', openingBalance: '', description: '' });
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create account');
    }
  };

  const groupedAccounts = TYPES.reduce((acc, type) => {
    acc[type] = accounts.filter(a => a.type === type && !a.parentAccount);
    return acc;
  }, {});

  if (isLoading) return <div className="p-8 text-center font-black text-slate-400 uppercase tracking-widest">Loading Chart of Accounts...</div>;

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Chart of Accounts</h1>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[9px] md:text-[10px] tracking-widest leading-loose">Manage your professional financial structure</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#044343] text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#033636] transition-all shadow-lg shadow-teal-900/10"
        >
          <Plus size={18} /> New Account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {TYPES.map(type => (
          <div key={type} className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-4 md:py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[10px] md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 md:gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  type === 'Assets' ? 'bg-emerald-500' :
                  type === 'Liabilities' ? 'bg-rose-500' :
                  type === 'Income' ? 'bg-sky-500' :
                  type === 'Expenses' ? 'bg-amber-500' : 'bg-indigo-500'
                }`} />
                {type}
              </h2>
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {groupedAccounts[type].length} Accounts
              </span>
            </div>
            
            <div className="divide-y divide-slate-50">
              {groupedAccounts[type].length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-[10px] font-bold italic">No {type} accounts defined yet.</div>
              ) : groupedAccounts[type].map(acc => (
                <AccountRow key={acc._id} account={acc} allAccounts={accounts} level={0} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Create New Account</h2>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Define a new ledger entry</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 md:p-8 custom-scrollbar">
                <form id="accountForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. HDFC Bank, Office Rent"
                        className="w-full h-11 md:h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#044343] transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Major Type</label>
                      <select
                        required
                        className="w-full h-11 md:h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                        value={formData.type}
                        onChange={e => {
                          const newType = e.target.value;
                          setFormData({ 
                            ...formData, 
                            type: newType, 
                            subType: SUB_TYPES[newType][0] 
                          });
                        }}
                      >
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub Type</label>
                      <select
                        required
                        className="w-full h-11 md:h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                        value={formData.subType}
                        onChange={e => setFormData({ ...formData, subType: e.target.value })}
                      >
                        {SUB_TYPES[formData.type].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent (Optional)</label>
                      <select
                        className="w-full h-11 md:h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                        value={formData.parentAccount}
                        onChange={e => setFormData({ ...formData, parentAccount: e.target.value })}
                      >
                        <option value="">Primary Account</option>
                        {accounts.filter(a => a.type === formData.type && !a.parentAccount && a._id !== formData._id).map(a => (
                          <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opening Balance</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full h-11 md:h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                        value={formData.openingBalance}
                        onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-[#044343] transition-all"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-50 flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="order-2 sm:order-1 flex-1 h-12 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  form="accountForm"
                  disabled={isAdding}
                  type="submit"
                  className="order-1 sm:order-2 flex-[2] h-12 bg-[#044343] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#033636] transition-all disabled:opacity-50 shadow-lg shadow-teal-900/10"
                >
                   {isAdding ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AccountRow = ({ account, allAccounts, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const children = allAccounts.filter(a => a.parentAccount?._id === account._id);
  const hasChildren = children.length > 0;

  return (
    <>
      <div 
        className={`flex items-center px-4 md:px-8 py-3 md:py-4 hover:bg-slate-50/50 transition-colors group ${level > 0 ? 'bg-slate-50/20' : ''}`}
        style={{ paddingLeft: `${(level * 1.5) + 1}rem` }}
      >
        <div className="flex-1 flex items-center gap-2 md:gap-4 min-w-0">
          {hasChildren ? (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
          )}
          
          <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            {account.subType === 'Cash' ? <Wallet size={16} /> : 
             account.subType === 'Bank' ? <Landmark size={16} /> : 
             account.subType === 'Student Receivable' ? <Users size={16} /> : <Home size={16} />}
          </div>

          <div className="min-w-0">
            <h3 className="text-xs md:text-sm font-black text-slate-900 truncate flex items-center gap-1.5 md:gap-2">
              {account.name}
              {account.isSystem && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-tighter">System</span>
              )}
            </h3>
            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{account.subType}</p>
          </div>
        </div>

        <div className="text-right mx-4 md:mx-8 shrink-0">
          <p className="text-xs md:text-sm font-black text-slate-900">₹{account.currentBalance.toLocaleString('en-IN')}</p>
          <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Balance</p>
        </div>

        <button className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all sm:opacity-0 group-hover:opacity-100 shrink-0">
          <MoreVertical size={16} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/10"
          >
            {children.map(child => (
              <AccountRow key={child._id} account={child} allAccounts={allAccounts} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountManagement;
