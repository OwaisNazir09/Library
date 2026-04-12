import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackages, createPackage, deletePackage, updatePackage } from '../../store/slices/packageSlice';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  X, 
  DollarSign, 
  Clock, 
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const PackageList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.packages);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPackage, setEditingPackage] = React.useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  React.useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editingPackage) {
        await dispatch(updatePackage({ id: editingPackage._id, ...data })).unwrap();
        toast.success('Package updated successfully');
      } else {
        await dispatch(createPackage(data)).unwrap();
        toast.success('Package created successfully');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err || 'Failed to save package');
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
        await dispatch(deletePackage(id)).unwrap();
        toast.success('Package deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete package');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    reset();
  };

  if (loading && items.length === 0) return <LoadingSkeleton type="card" rows={3} />;
  if (error) return <ErrorState message={error} onRetry={() => dispatch(fetchPackages())} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Packages</h1>
          <p className="text-slate-500 font-medium">Define and manage membership plans for your students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((pkg) => (
          <motion.div 
            layout
            key={pkg._id} 
            className="glass-card p-8 flex flex-col group hover:border-[#044343]/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#044343]">
                <Package size={24} />
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(pkg)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-teal-600 rounded-xl transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(pkg._id)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{pkg.name}</h3>
            <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 min-h-[2.5rem]">
              {pkg.description || 'No description provided for this package.'}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 text-slate-500">
                  <DollarSign size={16} className="text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Price</span>
                </div>
                <span className="text-sm font-black text-slate-900">${pkg.price}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 text-slate-500">
                  <Clock size={16} className="text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                </div>
                <span className="text-sm font-black text-slate-900">{pkg.duration} Days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 text-slate-500">
                  <BookOpen size={16} className="text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Max Books</span>
                </div>
                <span className="text-sm font-black text-slate-900">{pkg.maxBooks} Books</span>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2 text-[#044343] font-black text-[10px] uppercase tracking-[0.2em]">
              <CheckCircle2 size={14} />
              Featured Plan
            </div>
          </motion.div>
        ))}
        {items.length === 0 && !loading && (
          <div className="lg:col-span-3 py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Packages Yet</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">
              Create your first subscription package to start registering students.
            </p>
          </div>
        )}
      </div>

      {/* Package Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900">{editingPackage ? 'Edit Package' : 'Create Package'}</h2>
                <p className="text-slate-500 font-medium">Define the core parameters for this membership plan.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Package Name</label>
                    <input 
                      {...register('name', { required: true })}
                      placeholder="e.g., Diamond Monthly"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                    <input 
                      {...register('price', { required: true })}
                      type="number"
                      placeholder="49.99"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                    <input 
                      {...register('duration', { required: true })}
                      type="number"
                      placeholder="30"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Books Allowed</label>
                    <input 
                      {...register('maxBooks', { required: true })}
                      type="number"
                      placeholder="5"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea 
                    {...register('description')}
                    rows={3}
                    placeholder="Brief highlights of this package..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 w-full bg-[#044343] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    {editingPackage ? 'Update Package' : 'Save Package'}
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
