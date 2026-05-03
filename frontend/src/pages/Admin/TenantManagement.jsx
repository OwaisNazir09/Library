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
  LayoutGrid, Activity, Package, Settings, ShieldOff, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isAfter } from 'date-fns';

const TenantManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [actionMenu, setActionMenu] = React.useState(null);

  const { data: tenantsData, isLoading: loading, error, refetch } = useGetTenantsQuery({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter
  });
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
    } catch (err) { }
  };

  const onUpdateStatus = async (id, status) => {
    try {
      await updateTenantMutation({ id, data: { status } }).unwrap();
      toast.success(`Library status updated to ${status}`);
    } catch (err) { }
  };

  const onDelete = async (id) => {
    if (window.confirm('IRREVERSIBLE ACTION: Delete this library ecosystem and all associated data?')) {
      try {
        toast.success('Library decommissioned');
      } catch (err) { }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Libraries</h1>
          <p className="text-sm font-medium text-slate-500">Manage all library instances and their configurations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/packages')}
            className="btn btn-secondary btn-md"
          >
            <Package size={16} /> Manage Plans
          </button>
          <button
            onClick={() => navigate('/admin/libraries/create')}
            className="btn btn-primary btn-md shadow-lg shadow-teal-900/10"
          >
            <Plus size={16} /> Add New Library
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Libraries', value: tenants.length, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Global instances' },
          { label: 'Active Libraries', value: tenants.filter(t => t.status === 'active').length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Online now' },
          { label: 'Trial Instances', value: tenants.filter(t => t.status === 'trial').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Ending soon' },
        ].map((c, i) => (
          <div key={i} className="card p-6 border-transparent shadow-sm bg-white hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <c.icon size={24} className={c.color} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{c.value}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by library name, ID, subdomain or owner..."
            className="input pl-12 h-12 w-full bg-white border-slate-200 focus:border-teal-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {['all', 'active', 'trial', 'expired', 'suspended', 'disabled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === s
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="card p-0 overflow-hidden border-transparent shadow-sm">
        <div className="overflow-x-auto">
          <table className="table-main min-w-[1100px] min-h-[200px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4">Library Identity</th>
                <th>Owner & Contact</th>
                <th>Plan</th>
                <th>Students</th>
                <th>Status</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-teal-600" size={32} />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Libraries...</p>
                    </div>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Database size={48} className="text-slate-300" />
                      <p className="text-sm font-bold text-slate-500">No Libraries Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{tenant.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Globe size={10} className="text-slate-400" />
                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tight">{tenant.subdomain}.welib.app</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{tenant.ownerName || 'N/A'}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tenant.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-teal-50 text-[#044343] border border-teal-100 whitespace-nowrap">{tenant.plan}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-300 shrink-0" />
                        <span className="text-[12px] font-black text-slate-700">{tenant.limits?.maxStudents || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${tenant.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                        tenant.status === 'trial' ? 'bg-sky-50 text-sky-600' :
                          tenant.status === 'suspended' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {tenant.status === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {tenant.status}
                      </div>
                    </td>
                    <td className="px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedLibrary(tenant); setIsDetailsOpen(true); }}
                          className="p-2 text-slate-400 hover:text-[#044343] transition-colors"
                          title="View Details"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === tenant._id ? null : tenant._id)}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {actionMenu === tenant._id && (
                            <div className="absolute right-0 top-10 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-56 py-2 animate-in fade-in zoom-in duration-200">
                              <button
                                onClick={() => { setSelectedLibrary(tenant); setIsDetailsOpen(true); setActionMenu(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-slate-700 transition-colors text-left"
                              >
                                <Info size={16} className="text-blue-500" /> View Details
                              </button>
                              <button
                                onClick={() => { onUpdateStatus(tenant._id, 'suspended'); setActionMenu(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-rose-600 transition-colors text-left"
                              >
                                <ShieldOff size={16} /> Suspend Library
                              </button>
                              <button
                                onClick={() => { setSelectedLibrary(tenant); setIsAssignModalOpen(true); setActionMenu(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-teal-600 transition-colors text-left"
                              >
                                <Package size={16} /> Upgrade Plan
                              </button>
                              <div className="h-px bg-slate-50 my-1" />
                              <button
                                onClick={() => { onDelete(tenant._id); setActionMenu(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-rose-500 transition-colors text-left"
                              >
                                <Trash2 size={16} /> Decommission Library
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-panel w-full max-w-2xl">
              <div className="modal-h">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Provision New Library</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Spin up a new isolated library infrastructure.</p>
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
                        <option value="professional">Professional Plan</option>
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
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={14} /> Infrastructure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Database size={18} /></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">Database Instance</p><p className="text-[12px] font-bold text-slate-700">{selectedLibrary?.databaseName || 'shared_v1'}</p></div>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Globe size={18} /></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">Gateway</p><p className="text-[12px] font-bold text-slate-700">welib-edge-01</p></div>
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
    <div className="modal-wrapper">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="modal-panel w-full max-w-lg"
      >
        <div className="modal-h">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assign Package</h2>
            <p className="text-xs text-slate-500 font-medium">{library?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-b space-y-5">
            <div className="space-y-2">
              <label className="label">Select Package</label>
              <div className="grid grid-cols-1 gap-2">
                {loadingPlans ? (
                  <div className="text-center py-4"><Loader2 size={20} className="animate-spin inline text-[#044343]" /></div>
                ) : (
                  plans.map(plan => (
                    <label
                      key={plan._id}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.planId === plan._id ? 'border-[#044343] bg-teal-50/50 ring-1 ring-[#044343]' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={plan._id}
                          checked={formData.planId === plan._id}
                          onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                          className="w-4 h-4 text-[#044343]"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{plan.name}</p>
                          <p className="text-[10px] text-slate-500">₹{plan.price} / {plan.billingCycle}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
                        {Object.entries(plan.features).filter(([_, v]) => v).slice(0, 2).map(([k]) => (
                          <span key={k} className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase font-bold">{k.substring(0, 6)}</span>
                        ))}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="space-y-1">
                <label className="label">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="label">Internal Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific billing notes..."
                className="input min-h-[80px] py-2 resize-none"
              />
            </div>
          </div>

          <div className="modal-f">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-md px-6">Cancel</button>
            <button type="submit" disabled={isAssigning} className="btn btn-primary btn-md px-6 shadow-lg shadow-teal-900/10">
              {isAssigning ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={16} /> Confirm Assignment</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TenantManagement;
