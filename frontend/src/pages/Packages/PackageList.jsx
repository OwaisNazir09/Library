import React from 'react';
import { useGetPackagesQuery, useAddPackageMutation, useDeletePackageMutation, useUpdatePackageMutation } from '../../store/api/membershipApi';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  X,
  IndianRupeeIcon,
  Clock,
  BookOpen,
  AlertCircle,
  Loader2,
  ChevronRight
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
        toast.success('Package updated successfully');
      } else {
        await addPackage(data).unwrap();
        toast.success('Package created successfully');
      }
      handleCloseModal();
    } catch (err) {
      // Handled globally
    }
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
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackageMutation(id).unwrap();
        toast.success('Package deleted');
      } catch (err) {
        // Handled globally
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    reset();
  };

  if (loading && items.length === 0) return <LoadingSkeleton type="card" rows={3} />;
  if (error) return <ErrorState message={error.data?.message || 'Error loading packages'} onRetry={refetch} />;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            <span>Members</span>
            <ChevronRight size={12} />
            <span className="text-[#044343]">Packages</span>
          </div>
          <h1>Subscription Packages</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-default"
        >
          <Plus size={16} />
          Create Package
        </button>
      </div>

      <div className="compact-table-container">
        <table className="compact-table">
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Max Books</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((pkg) => (
              <tr key={pkg._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-50 rounded flex items-center justify-center text-[#044343]">
                      <Package size={16} />
                    </div>
                    <span className="font-medium text-slate-900">{pkg.name}</span>
                  </div>
                </td>
                <td className="font-medium text-slate-900">₹{pkg.price}</td>
                <td className="text-slate-600">{pkg.duration} Days</td>
                <td className="text-slate-600">{pkg.maxBooks} Books</td>
                <td className="text-slate-500 text-[12px] max-w-[200px] truncate">{pkg.description || '-'}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(pkg)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(pkg._id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-500">
            No packages available.
          </div>
        )}
      </div>

      {/* Package Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content modal-md"
            >
              <div className="modal-header">
                <h2>{editingPackage ? 'Edit Package' : 'Create Package'}</h2>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
                <div className="modal-body space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Package Name</label>
                      <input
                        {...register('name', { required: true })}
                        placeholder="e.g., Diamond Monthly"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Price ($)</label>
                      <input
                        {...register('price', { required: true })}
                        type="number"
                        placeholder="49.99"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Duration (Days)</label>
                      <input
                        {...register('duration', { required: true })}
                        type="number"
                        placeholder="30"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Max Books Allowed</label>
                      <input
                        {...register('maxBooks', { required: true })}
                        type="number"
                        placeholder="5"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Description (Optional)</label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder="Brief highlights..."
                      className="input-field py-2 h-auto resize-none"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary btn-default">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || isUpdating}
                    className="btn btn-primary btn-default min-w-[120px]"
                  >
                    {(isAdding || isUpdating) ? <Loader2 size={16} className="animate-spin" /> : (editingPackage ? 'Update' : 'Save Package')}
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
