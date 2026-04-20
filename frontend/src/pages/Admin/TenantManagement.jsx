import React from 'react';
import { useGetTenantsQuery, useCreateTenantMutation, useDeleteTenantMutation } from '../../store/api/adminApi';
import { 
  Plus, Search, MoreHorizontal, Trash2, ExternalLink, Calendar,
  Database, Loader2, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

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
      toast.success('Library node created');
      setIsModalOpen(false);
      reset();
    } catch (err) {}
  };

  const onDelete = async (id) => {
    if (window.confirm('Delete this library instance? This action is irreversible.')) {
      try {
        await deleteTenantMutation(id).unwrap();
        toast.success('Library node removed');
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Library Nodes</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage library instances and platform tenant isolation</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-md">
          <Plus size={16} /> Provision New Node
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Filter nodes..." className="w-64 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
         </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Library Identity</th>
              <th>Instance Info</th>
              <th>Domain</th>
              <th>Status</th>
              <th className="px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin inline-block text-teal-600" size={24} /></td></tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-[#044343] border border-teal-100 text-[14px]">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-none">{tenant.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">ID: {tenant._id.substring(18)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                        <Database size={12} className="text-teal-600" /> {tenant.databaseName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-tighter">
                        <Calendar size={12} /> {new Date(tenant.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info lowercase">{tenant.subdomain || 'internal'}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Live</span>
                    </div>
                  </td>
                  <td className="px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn btn-ghost btn-sm w-8 h-8 p-0"><ExternalLink size={16} /></button>
                      <button onClick={() => onDelete(tenant._id)} className="btn btn-ghost btn-sm w-8 h-8 p-0 text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && !tenants.length && <tr><td colSpan="5" className="p-20 text-center text-slate-400 italic text-xs">No library nodes provisioned yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-md">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Provision New Library</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onAddTenant)} className="flex flex-col">
                <div className="modal-b space-y-4">
                  <div className="space-y-1.5"><label className="label">Library Name</label><input {...register('name')} required placeholder="e.g. Central Library" className="input" /></div>
                  <div className="space-y-1.5"><label className="label">Subdomain Hash</label><input {...register('subdomain')} required placeholder="e.g. central-lib" className="input" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="label">Admin Email</label><input {...register('email')} required type="email" placeholder="admin@lib.com" className="input" /></div>
                    <div className="space-y-1.5"><label className="label">Password</label><input {...register('password')} required type="password" placeholder="••••••••" className="input" /></div>
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isCreating} className="btn btn-primary btn-md px-8 min-w-[140px]">{isCreating ? <Loader2 size={16} className="animate-spin" /> : 'Provision Node'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantManagement;
