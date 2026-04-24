import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Package,
  IndianRupee,
  Clock,
  Layout,
  Users,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  useGetPlansQuery, 
  useCreatePlanMutation, 
  useUpdatePlanMutation, 
  useDeletePlanMutation 
} from '../../store/api/adminApi';
import { toast } from 'react-hot-toast';

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const { data, isLoading } = useGetPlansQuery();
  const [createPlan] = useCreatePlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const plans = data?.data?.plans || [];

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePlan(id).unwrap();
        toast.success('Package deleted successfully');
      } catch (error) {
        toast.error('Failed to delete package');
      }
    }
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Packages & Plans</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage platform subscription packages</p>
        </div>
        <button 
          onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#044343] text-white rounded-xl font-semibold hover:bg-[#033535] transition-all shadow-lg shadow-teal-900/10 active:scale-95"
        >
          <Plus size={18} />
          <span>Create Package</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search packages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30">
            {plans.length} Total Packages
          </div>
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
            {plans.filter(p => p.status === 'active').length} Active
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Package Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price & Cycle</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Features</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trial Days</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading packages...</td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No packages found</td>
                </tr>
              ) : filteredPlans.map((plan) => (
                <tr key={plan._id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 dark:bg-teal-900/30">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{plan.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{plan.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-slate-100">₹{plan.price}</span>
                      <span className="text-xs text-slate-500 capitalize">{plan.billingCycle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {Object.entries(plan.features || {})
                        .filter(([_, enabled]) => enabled)
                        .slice(0, 3)
                        .map(([key]) => (
                          <span key={key} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium dark:bg-slate-800 dark:text-slate-400">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      {Object.values(plan.features || {}).filter(Boolean).length > 3 && (
                        <span className="text-[10px] text-slate-400">+{Object.values(plan.features || {}).filter(Boolean).length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock size={14} />
                      <span className="text-sm">{plan.trialDays} Days</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all dark:hover:bg-teal-900/30"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(plan._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all dark:hover:bg-rose-900/30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Form Modal */}
      {isModalOpen && (
        <PackageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingPlan={editingPlan}
          createPlan={createPlan}
          updatePlan={updatePlan}
        />
      )}
    </div>
  );
};

const PackageModal = ({ isOpen, onClose, editingPlan, createPlan, updatePlan }) => {
  const [formData, setFormData] = useState(editingPlan || {
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    trialDays: 7,
    features: {
      bookManagement: true,
      students: true,
      circulation: true,
      digitalLibrary: false,
      finance: false,
      reports: false,
      studyDesks: false,
      multiBranch: false,
      staffAccounts: false,
      apiAccess: false,
      blogs: false,
      dailyQuotes: false
    },
    limits: {
      maxBooks: 500,
      maxStudents: 300,
      maxStaff: 5,
      maxBranches: 1,
      storageLimit: 1024
    },
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, data: formData }).unwrap();
        toast.success('Package updated successfully');
      } else {
        await createPlan(formData).unwrap();
        toast.success('Package created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingPlan ? 'Edit Package' : 'Create New Package'}
            </h2>
            <p className="text-sm text-slate-500">Define plan details, features and limits</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layout size={14} />
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Package Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Billing Cycle</label>
                <select 
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price (INR ₹)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trial Days</label>
                <input 
                  type="number" 
                  value={formData.trialDays}
                  onChange={(e) => setFormData({...formData, trialDays: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none h-20 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Feature Toggles */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} />
              Enable Modules
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(formData.features).map((feature) => (
                <label key={feature} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <input 
                    type="checkbox" 
                    checked={formData.features[feature]}
                    onChange={(e) => setFormData({
                      ...formData, 
                      features: { ...formData.features, [feature]: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-[13px] font-medium text-slate-700 capitalize dark:text-slate-300">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Limits */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings size={14} />
              Usage Limits
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.keys(formData.limits).map((limit) => (
                <div key={limit} className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    {limit.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input 
                    type="number" 
                    value={formData.limits[limit]}
                    onChange={(e) => setFormData({
                      ...formData, 
                      limits: { ...formData.limits, [limit]: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-[#044343] text-white font-semibold hover:bg-[#033535] transition-all shadow-lg shadow-teal-900/10 active:scale-95"
            >
              {editingPlan ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Packages;
