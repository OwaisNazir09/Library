import React from 'react';
import { useGetPackagesQuery, useAddPackageMutation, useDeletePackageMutation, useUpdatePackageMutation } from '../../store/api/membershipApi';
import { 
  Package, Plus, Trash2, Edit, CheckCircle2, X, 
  IndianRupeeIcon, Clock, BookOpen, AlertCircle, 
  Loader2, ChevronRight 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const PackageList = () => {
  const { data: packagesData, isLoading: loading, error, refetch } = useGetPackagesQuery();
  const [addPackage, { isLoading: isAdding }] = useAddPackageMutation();
  const [updatePackageMutation, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [deletePackageMutation] = useDeletePackageMutation();

  const items = packagesData?.data?.packages || [];

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPackage, setEditingPackage] = React.useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = async (data) => {
    try {
      if (editingPackage) {
        await updatePackageMutation({ id: editingPackage._id, data }).unwrap();
        toast.success('Package updated');
      } else {
        await addPackage(data).unwrap();
        toast.success('Package created');
      }
      handleCloseModal();
    } catch (err) {}
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setValue('name', pkg.name);
    setValue('duration', pkg.duration);
    setValue('price', pkg.price);
    setValue('maxBooks', pkg.maxBooks);
    setValue('description', pkg.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this package?')) {
      try {
        await deletePackageMutation(id).unwrap();
        toast.success('Package removed');
      } catch (err) {}
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    reset();
  };

  if (loading && items.length === 0) return <LoadingSkeleton type="table" rows={5} />;
  if (error) return <ErrorState message="Error loading packages" onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage library membership packages and pricing</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-md">
          <Plus size={16} />
          Create New Plan
        </button>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Plan Name</th>
              <th>Pricing</th>
              <th>Duration</th>
              <th>Book Limit</th>
              <th>Description</th>
              <th className="text-right px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((pkg) => (
              <tr key={pkg._id}>
                <td className="px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-teal-50 rounded flex items-center justify-center text-[#044343] border border-teal-100">
                      <Package size={14} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">{pkg.name}</span>
                  </div>
                </td>
                <td><span className="font-bold text-slate-900">₹{pkg.price}</span></td>
                <td className="text-[12px] font-medium text-slate-600">{pkg.duration} Days</td>
                <td className="text-[12px] font-medium text-slate-600">{pkg.maxBooks} Books</td>
                <td className="text-[11px] text-slate-400 truncate max-w-[250px]">{pkg.description || '-'}</td>
                <td className="px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(pkg)} className="btn btn-ghost btn-sm w-7 h-7 p-0"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(pkg._id)} className="btn btn-ghost btn-sm w-7 h-7 p-0 text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="6" className="p-10 text-center text-slate-400 text-xs italic">No plans created yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-md">
              <div className="modal-h">
                <h2 className="text-sm font-bold">{editingPackage ? 'Update Plan' : 'Define New Plan'}</h2>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <div className="modal-b space-y-4">
                  <div className="space-y-1.5">
                    <label className="label">Plan Name</label>
                    <input {...register('name', { required: true })} placeholder="e.g. Platinum Plus" className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">Price (INR)</label>
                      <input {...register('price', { required: true })} type="number" className="input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Duration (Days)</label>
                      <input {...register('duration', { required: true })} type="number" className="input" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Max Books Allowed</label>
                    <input {...register('maxBooks', { required: true })} type="number" className="input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Description</label>
                    <textarea {...register('description')} rows={2} className="input h-auto py-2 resize-none" placeholder="Features..." />
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-md px-8 min-w-[120px]">
                    {isAdding || isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Save Plan'}
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

export default PackageList;
