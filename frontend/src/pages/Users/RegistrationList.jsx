import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, addUser, updateUser } from '../../store/slices/userSlice';
import { fetchPackages } from '../../store/slices/packageSlice';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  X, 
  UserPlus, 
  Calendar, 
  Clock, 
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const RegistrationList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.users);
  const { items: packages } = useSelector((state) => state.packages);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  
  const { register, handleSubmit, reset } = useForm();
  const { register: regAssign, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm();

  const loadData = React.useCallback(() => {
    dispatch(fetchUsers());
    dispatch(fetchPackages());
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRegisterStudent = async (data) => {
    try {
      await dispatch(addUser({ ...data, role: 'member' })).unwrap();
      toast.success('Student registered successfully!');
      setIsRegisterModalOpen(false);
      reset();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const onAssignPackage = async (data) => {
    try {
      await dispatch(updateUser({ id: selectedUser._id, package: data.packageId })).unwrap();
      toast.success('Package assigned successfully!');
      setIsAssignModalOpen(false);
      resetAssign();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    }
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  const getStatusInfo = (user) => {
    if (!user.packageEndDate) return { label: 'No Package', color: 'bg-slate-100 text-slate-500' };
    
    const isExpired = !isAfter(parseISO(user.packageEndDate), new Date());
    if (isExpired) return { label: 'Expired', color: 'bg-rose-100 text-rose-600' };
    
    return { label: 'Active', color: 'bg-emerald-100 text-emerald-600' };
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="p-8">
            <LoadingSkeleton type="table" rows={8} />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="6" className="p-12">
            <ErrorState message={error} onRetry={loadData} />
          </td>
        </tr>
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="p-12">
            <EmptyState 
              title="No Students Registered" 
              message="Start by adding your first student to the system."
              onAction={() => setIsRegisterModalOpen(true)}
              actionLabel="Register Student"
              icon={UserPlus}
            />
          </td>
        </tr>
      );
    }

    return items.map((student) => {
      const status = getStatusInfo(student);
      const daysLeft = student.packageEndDate ? differenceInDays(parseISO(student.packageEndDate), new Date()) : 0;

      return (
        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#044343] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-teal-900/10">
                {student.fullName?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">{student.fullName}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">UID: {student._id.substring(18)}</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                <Mail size={12} className="text-teal-600" />
                {student.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                <Phone size={12} className="text-teal-600" />
                {student.phone || 'No Phone'}
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <CreditCard size={14} />
              </div>
              <span className="text-xs font-black text-slate-900">
                {student.package?.name || 'N/A'}
              </span>
            </div>
          </td>
          <td className="px-6 py-5">
            {student.packageEndDate ? (
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900">{format(parseISO(student.packageEndDate), 'MMM dd, yyyy')}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${daysLeft > 7 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {daysLeft > 0 ? `${daysLeft} Days left` : 'Expired'}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Data</span>
            )}
          </td>
          <td className="px-6 py-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${status.color}`}>
              {status.label}
            </span>
          </td>
          <td className="px-8 py-5 text-right">
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => openAssignModal(student)}
                className="bg-white border border-slate-200 text-[#044343] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#044343] hover:text-white transition-all shadow-sm"
              >
                Assign Package
              </button>
              <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Registrations</h1>
          <p className="text-slate-500 font-medium">Capture details, assign packages and track student lifecycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-bold text-xs"
            />
          </div>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-teal-900/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            Register Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plan</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Student Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Register New Student</h2>
              <p className="text-slate-500 font-medium mb-8">Onboard a student and assign an optional membership.</p>
              
              <form onSubmit={handleSubmit(onRegisterStudent)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input {...register('fullName', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input {...register('email', { required: true })} type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input {...register('phone')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membership Plan</label>
                  <select {...register('package')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 text-xs font-bold appearance-none">
                    <option value="">No Package (Trial)</option>
                    {packages.map(pkg => (
                      <option key={pkg._id} value={pkg._id}>{pkg.name} (${pkg.price})</option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-teal-900/10 active:scale-95 transition-all text-sm uppercase tracking-widest">
                  Complete Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Package Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-[#044343] mx-auto mb-4">
                  <CreditCard size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Assign Package</h2>
                <p className="text-sm font-medium text-slate-500">To: {selectedUser?.fullName}</p>
              </div>

              <form onSubmit={handleAssignSubmit(onAssignPackage)} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Active Plan</label>
                  <select {...regAssign('packageId', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 text-xs font-bold">
                    <option value="">Select a package...</option>
                    {packages.map(pkg => (
                      <option key={pkg._id} value={pkg._id}>{pkg.name} — {pkg.duration} Days (${pkg.price})</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-1" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                    Updating the package will reset the membership cycle starting from today.
                  </p>
                </div>

                <button type="submit" className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all text-sm uppercase tracking-widest">
                  Assign Package Now
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationList;
