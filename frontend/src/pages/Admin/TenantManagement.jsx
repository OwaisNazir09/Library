import React from 'react';
import { useGetTenantsQuery, useCreateTenantMutation, useDeleteTenantMutation } from '../../store/api/adminApi';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  ExternalLink, 
  Calendar,
  Database,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const TenantManagement = () => {
  const { data: tenantsData, isLoading: loading, error, refetch } = useGetTenantsQuery();
  const [createTenantMutation, { isLoading: isCreating }] = useCreateTenantMutation();
  const [deleteTenantMutation] = useDeleteTenantMutation();

  const tenants = tenantsData?.data || [];
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onAddTenant = async (data) => {
    try {
      await createTenantMutation(data).unwrap();
      toast.success('Library created successfully!');
      setIsModalOpen(false);
      reset();
    } catch (err) {
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('WARNING: Deleting a library will remove all its data. Continue?')) {
      try {
        await deleteTenantMutation(id).unwrap();
        toast.success('Library removed from platform');
      } catch (err) {
        // Handled globally
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Library Nodes</h1>
          <p className="text-slate-400 font-medium">Manage library instances and platform isolation.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#044343] text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center gap-2 shadow-xl shadow-teal-900/10 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Provision New Node
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-teal-900/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Filter nodes by ID, name, or database..."
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#044343]/5"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-10 py-6">Library Identity</th>
                <th className="px-6 py-6">Instance Info</th>
                <th className="px-6 py-6">Domain</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-10 py-6 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-[#044343]" size={32} />
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#044343] text-xl">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{tenant.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">ID: {tenant._id.substring(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Database size={14} className="text-teal-600" />
                          {tenant.databaseName}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Calendar size={14} className="text-teal-600" />
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <span className="text-xs font-black text-[#044343] bg-teal-50 px-3 py-1 rounded-lg">
                        {tenant.subdomain || 'internal'}
                      </span>
                    </td>
                    <td className="px-6 py-8">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 hover:bg-slate-100 transition-all">
                          <ExternalLink size={18} />
                        </button>
                        <button onClick={() => onDelete(tenant._id)} className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600 hover:bg-rose-100 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Provision Node</h2>
            <p className="text-slate-400 font-medium mb-10 text-sm">Create a new isolated library instance on the platform.</p>

            <form onSubmit={handleSubmit(onAddTenant)} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Library Name</label>
                <input {...register('name')} required placeholder="e.g. Gotham City Memorial" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subdomain Hash</label>
                <input {...register('subdomain')} required placeholder="e.g. gotham-lib" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                  <input {...register('email')} required type="email" placeholder="admin@lib.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Pass</label>
                  <input {...register('password')} required type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 font-bold text-sm" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-[#044343] text-white font-black py-5 rounded-3xl mt-6 shadow-2xl shadow-teal-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 size={24} className="animate-spin" /> : 'Create & Provision Library'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
