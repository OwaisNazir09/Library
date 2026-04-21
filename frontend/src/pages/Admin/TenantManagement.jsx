import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetTenantsQuery, 
  useCreateTenantMutation, 
  useDeleteTenantMutation,
  useUpdateTenantMutation,
  useGetLibraryAnalyticsQuery,
  useGetPlansQuery,
  useAssignPlanMutation
} from '../../store/api/adminApi';
import { 
  Plus, Search, MoreHorizontal, Trash2, ExternalLink, Calendar,
  Database, Loader2, X, Globe, Shield, User, Mail, Phone, 
  CreditCard, Info, AlertTriangle, CheckCircle2, History,
  LayoutGrid, Activity, Package, Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isAfter } from 'date-fns';

const TenantManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data: tenantsData, isLoading: loading, error, refetch } = useGetTenantsQuery({ search: searchTerm });
  const [createTenantMutation, { isLoading: isCreating }] = useCreateTenantMutation();
  const [updateTenantMutation, { isLoading: isUpdating }] = useUpdateTenantMutation();
  const [deleteTenantMutation] = useDeleteTenantMutation();

  const tenants = tenantsData?.data || [];
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedLibrary, setSelectedLibrary] = React.useState(null);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  
  const { register, handleSubmit, reset } = useForm();

  const onAddTenant = async (data) => {
    try {
      await createTenantMutation(data).unwrap();
      toast.success('New library infrastructure provisioned');
      setIsModalOpen(false);
      reset();
    } catch (err) {}
  };

  const onUpdateStatus = async (id, status) => {
    try {
      await updateTenantMutation({ id, data: { status } }).unwrap();
      toast.success(`Library status updated to ${status}`);
    } catch (err) {}
  };

  const onDelete = async (id) => {
    if (window.confirm('IRREVERSIBLE ACTION: Delete this library ecosystem and all associated data?')) {
      try {
        await deleteTenantMutation(id).unwrap();
        toast.success('Library node decommissioned');
      } catch (err) {}
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'trial': return 'badge-info';
      case 'expired': return 'badge-danger';
      case 'suspended': return 'badge-warning';
      case 'disabled': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Nodes</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Global management of isolated tenant instances.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin/packages')} className="btn btn-secondary btn-md px-6 flex items-center gap-2">
            <Package size={18} /> Manage Plans
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-md px-6">
            <Plus size={18} /> Provision New Node
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by library name, ID or owner..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96 input pl-10" 
            />
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
               <Shield size={14} className="text-emerald-500" />
               <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{tenants.length} Managed Nodes</span>
            </div>
         </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">Library Identity</th>
              <th>Owner & Contact</th>
              <th>Subscription</th>
              <th>Timeline</th>
              <th>Status</th>
              <th className="px-6 text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-20 text-center"><Loader2 className="animate-spin inline-block text-[#044343]" size={32} /></td></tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedLibrary(tenant); setIsDetailsOpen(true); }}>
                  <td className="px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-[#044343] border border-slate-100 shadow-sm">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 leading-none">{tenant.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">ID: {tenant._id.substring(18).toUpperCase()}</p>
                        <p className="text-[10px] text-teal-600 font-bold mt-1 lowercase">{tenant.subdomain}.welib.app</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5">
                       <p className="text-[13px] font-bold text-slate-700 leading-none">{tenant.ownerName || 'N/A'}</p>
                       <p className="text-[11px] text-slate-400 font-medium">{tenant.email}</p>
                       <p className="text-[11px] text-slate-400 font-medium">{tenant.phone || '-'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5">
                       <span className="text-[12px] font-bold text-[#044343] uppercase tracking-widest">{tenant.plan}</span>
                       <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${tenant.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{tenant.paymentStatus}</span>
                       </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                          <Calendar size={12} className="text-slate-300" /> Exp: {tenant.expiryDate ? format(parseISO(tenant.expiryDate), 'dd MMM yy') : 'N/A'}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          Provisioned {format(parseISO(tenant.createdAt), 'dd MMM yy')}
                       </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(tenant.status)}`}>{tenant.status}</span>
                  </td>
                  <td className="px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedLibrary(tenant); setIsAssignModalOpen(true); }} title="Assign Package" className="btn btn-secondary btn-sm w-9 h-9 p-0 rounded-xl text-teal-600 hover:bg-teal-50"><Package size={16} /></button>
                      <button onClick={() => { setSelectedLibrary(tenant); setIsDetailsOpen(true); }} className="btn btn-secondary btn-sm w-9 h-9 p-0 rounded-xl"><Info size={16} /></button>
                      <button onClick={() => onDelete(tenant._id)} className="btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Provision Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-panel w-full max-w-2xl">
              <div className="modal-h">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Provision New Library</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Spin up a new isolated library infrastructure node.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit(onAddTenant)}>
                <div className="modal-b space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">Library Entity Name</label>
                      <input {...register('name')} required placeholder="e.g. Oxford Public Library" className="input" />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Target Subdomain</label>
                      <div className="relative">
                        <input {...register('subdomain')} required placeholder="oxford-lib" className="input pr-24" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">.welib.app</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label">Owner Full Name</label>
                      <input {...register('ownerName')} required placeholder="John Doe" className="input" />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Contact Phone</label>
                      <input {...register('phone')} required placeholder="+91 ..." className="input" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="label">Service Plan</label>
                       <select {...register('plan')} className="input font-bold cursor-pointer">
                          <option value="trial">Free Trial (14 Days)</option>
                          <option value="starter">Starter Plan</option>
                          <option value="professional">Professional Node</option>
                          <option value="enterprise">Enterprise Ecosystem</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="label">Trial Duration (Days)</label>
                       <input {...register('trialDays')} type="number" defaultValue={14} className="input" />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                       <Shield size={14} className="text-[#044343]" />
                       <span className="text-[11px] font-bold text-[#044343] uppercase tracking-widest">Master Admin Access</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="label">Authority Email</label>
                        <input {...register('email')} required type="email" placeholder="admin@oxford.com" className="input bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="label">Secure Password</label>
                        <input {...register('password')} required type="password" placeholder="••••••••" className="input bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md px-8">Discard</button>
                  <button type="submit" disabled={isCreating} className="btn btn-primary btn-md px-10 min-w-[180px]">
                    {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Deploy Infrastructure'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Library Details Drawer */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailsOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div 
               initial={{ x: '100%' }} 
               animate={{ x: 0 }} 
               exit={{ x: '100%' }} 
               transition={{ type: 'spring', damping: 30, stiffness: 300 }}
               className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
             >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#044343] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-teal-900/10">
                         {selectedLibrary?.name.charAt(0)}
                      </div>
                      <div>
                         <h2 className="text-xl font-bold text-slate-900 leading-none">{selectedLibrary?.name}</h2>
                         <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                           <Globe size={12} /> {selectedLibrary?.subdomain}.welib.app
                         </p>
                      </div>
                   </div>
                   <button onClick={() => setIsDetailsOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                   {/* Status Control */}
                   <section className="space-y-4">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Authority Actions
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {['active', 'suspended', 'disabled', 'expired'].map(status => (
                           <button 
                            key={status}
                            onClick={() => onUpdateStatus(selectedLibrary._id, status)}
                            className={`px-4 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${selectedLibrary?.status === status ? 'bg-[#044343] text-white border-[#044343] shadow-md' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                           >
                             {status}
                           </button>
                         ))}
                      </div>
                   </section>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Library Info */}
                      <section className="space-y-5">
                         <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Identity Profile</h3>
                         <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Owner Name</p><p className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><User size={14} /> {selectedLibrary?.ownerName}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email Endpoint</p><p className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><Mail size={14} /> {selectedLibrary?.email}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Phone</p><p className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><Phone size={14} /> {selectedLibrary?.phone || 'Not available'}</p></div>
                         </div>
                      </section>

                      {/* Billing Info */}
                      <section className="space-y-5">
                         <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Financial Status</h3>
                         <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Plan</p><p className="text-[13px] font-bold text-[#044343] uppercase tracking-widest">{selectedLibrary?.plan}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Status</p><p className="text-[13px] font-bold text-slate-700 flex items-center gap-2 uppercase">{selectedLibrary?.paymentStatus}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Renewal Date</p><p className="text-[13px] font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} /> {selectedLibrary?.expiryDate ? format(parseISO(selectedLibrary.expiryDate), 'dd MMMM yyyy') : 'N/A'}</p></div>
                         </div>
                      </section>
                   </div>

                   {/* Limits */}
                   <section className="space-y-5">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings size={14} /> Usage Limits</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {Object.keys(selectedLibrary?.limits || {}).map((limit) => (
                           <div key={limit} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{limit.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <input 
                                type="number" 
                                defaultValue={selectedLibrary.limits[limit]}
                                onBlur={(e) => {
                                  const newVal = Number(e.target.value);
                                  if (newVal === selectedLibrary.limits[limit]) return;
                                  const newLimits = { ...selectedLibrary.limits, [limit]: newVal };
                                  updateTenantMutation({ id: selectedLibrary._id, data: { limits: newLimits } }).unwrap()
                                    .then(() => setSelectedLibrary({ ...selectedLibrary, limits: newLimits }));
                                }}
                                className="w-full bg-slate-50 border-none text-[13px] font-bold text-slate-700 p-2 rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                              />
                           </div>
                         ))}
                      </div>
                   </section>

                   {/* Tech Details */}
                   <section className="space-y-5">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={14} /> Infrastructure Node</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Database size={18} /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Database Instance</p><p className="text-[12px] font-bold text-slate-700">{selectedLibrary?.databaseName || 'shared_v1'}</p></div>
                         </div>
                         <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Globe size={18} /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Gateway Node</p><p className="text-[12px] font-bold text-slate-700">welib-edge-01</p></div>
                         </div>
                      </div>
                   </section>

                   {/* Features */}
                   <section className="space-y-5">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><LayoutGrid size={14} /> Feature Flags</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {Object.keys(selectedLibrary?.features || {}).map((feature) => (
                           <div key={feature} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600 uppercase">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <button 
                                onClick={() => {
                                  const newFeatures = { ...selectedLibrary.features, [feature]: !selectedLibrary.features[feature] };
                                  updateTenantMutation({ id: selectedLibrary._id, data: { features: newFeatures } }).unwrap()
                                    .then(() => setSelectedLibrary({ ...selectedLibrary, features: newFeatures }));
                                }}
                                className={`w-10 h-5 rounded-full relative transition-colors ${selectedLibrary.features[feature] ? 'bg-teal-600' : 'bg-slate-200'}`}
                              >
                                 <motion.div 
                                   animate={{ x: selectedLibrary.features[feature] ? 20 : 0 }}
                                   className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                                 />
                              </button>
                           </div>
                         ))}
                      </div>
                   </section>
                </div>

                <div className="p-8 border-t border-slate-50 flex items-center gap-4 bg-slate-50/30">
                   <button onClick={() => setIsDetailsOpen(false)} className="btn btn-secondary btn-md px-10">Close Details</button>
                   <button className="btn btn-primary btn-md px-10 flex-1">Open Library Console <ExternalLink size={16} className="ml-2" /></button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Assign Package Modal */}
      {isAssignModalOpen && (
        <AssignPackageModal 
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          library={selectedLibrary}
        />
      )}
    </div>
  );
};

const AssignPackageModal = ({ isOpen, onClose, library }) => {
  const { data: plansData, isLoading: loadingPlans } = useGetPlansQuery();
  const [assignPlan, { isLoading: isAssigning }] = useAssignPlanMutation();
  const plans = plansData?.data?.plans || [];

  const [formData, setFormData] = React.useState({
    planId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.planId) return toast.error('Please select a package');

    try {
      await assignPlan({
        libraryId: library._id,
        planId: formData.planId,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        notes: formData.notes
      }).unwrap();
      
      toast.success('Package assigned successfully');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign package');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden dark:bg-slate-900"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assign Package</h2>
            <p className="text-xs text-slate-500 font-medium">{library?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Package</label>
            <div className="grid grid-cols-1 gap-2">
              {loadingPlans ? (
                <div className="text-center py-4"><Loader2 size={20} className="animate-spin inline text-teal-600" /></div>
              ) : (
                plans.map(plan => (
                  <label 
                    key={plan._id} 
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.planId === plan._id ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500 dark:bg-teal-900/20' : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="plan" 
                        value={plan._id} 
                        checked={formData.planId === plan._id}
                        onChange={(e) => setFormData({...formData, planId: e.target.value})}
                        className="w-4 h-4 text-teal-600"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{plan.name}</p>
                        <p className="text-[10px] text-slate-500">₹{plan.price} / {plan.billingCycle}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
                       {Object.entries(plan.features).filter(([_, v]) => v).slice(0, 2).map(([k]) => (
                         <span key={k} className="text-[8px] bg-slate-100 px-1 rounded text-slate-400 uppercase font-black">{k.substring(0, 4)}</span>
                       ))}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Expiry Date</label>
              <input 
                type="date" 
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Internal Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any specific billing notes..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none h-20 resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
             <button type="button" onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all dark:border-slate-800 dark:hover:bg-slate-800">Cancel</button>
             <button type="submit" disabled={isAssigning} className="flex-[2] px-6 py-3 rounded-xl bg-[#044343] text-white text-sm font-bold hover:bg-[#033535] transition-all shadow-lg shadow-teal-900/10 active:scale-95 flex items-center justify-center gap-2">
                {isAssigning ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Confirm Assignment</>}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TenantManagement;
