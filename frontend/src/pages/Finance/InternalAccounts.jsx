import React from 'react';
import { 
  useGetInternalAccountsQuery, 
  useAddInternalAccountMutation 
} from '../../store/api/financeApi';
import { 
  Wallet, Banknote, CreditCard, Landmark, 
  Plus, MoreVertical, Loader2, X, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const ACCOUNT_ICONS = {
  cash: Banknote,
  bank: Landmark,
  upi: CreditCard,
  online: CreditCard,
  petty_cash: Wallet
};

const InternalAccounts = () => {
  const { data: accountsData, isLoading } = useGetInternalAccountsQuery();
  const [addAccount] = useAddInternalAccountMutation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const { register, handleSubmit, reset } = useForm();
  
  const onSubmit = async (data) => {
    try {
      await addAccount(data).unwrap();
      toast.success('Account created successfully');
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create account');
    }
  };

  const accounts = accountsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Financial Accounts</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage cash, bank & online balances</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#044343] text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:bg-[#033636] transition-all"
        >
          <Plus size={16} /> New Account
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => {
            const Icon = ACCOUNT_ICONS[acc.type] || Wallet;
            return (
              <motion.div
                key={acc._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    acc.type === 'cash' ? 'bg-emerald-50 text-emerald-600' :
                    acc.type === 'bank' ? 'bg-sky-50 text-sky-600' :
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-black text-slate-900">{acc.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{acc.type.replace('_', ' ')}</p>
                
                <div className="mt-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Current Balance</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    ₹{acc.currentBalance.toLocaleString('en-IN')}
                  </p>
                </div>

                {acc.isDefault && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Default Account
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Add a new financial account</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                  <input
                    {...register('name', { required: true })}
                    placeholder="e.g. Petty Cash"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#044343] font-bold placeholder:text-slate-300 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                    <select
                      {...register('type', { required: true })}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#044343] font-bold appearance-none transition-all"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="upi">UPI</option>
                      <option value="online">Online</option>
                      <option value="petty_cash">Petty Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Opening Balance</label>
                    <input
                      type="number"
                      {...register('openingBalance', { valueAsNumber: true })}
                      placeholder="0"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#044343] font-bold placeholder:text-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description (Optional)</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Brief details about the account..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#044343] font-bold placeholder:text-slate-300 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-[#044343] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:bg-[#033636] transition-all mt-4"
                >
                  Create Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InternalAccounts;
