import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUser, addUser, updateUser } from '../../store/slices/userSlice';
import { fetchPackages } from '../../store/slices/packageSlice';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Coffee,
  X,
  UserPlus,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  ImagePlus,
  MapPin,
  Fingerprint,
  FileText,
  Upload,
  ArrowRight,
  Key,
  UserCheck,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const RegistrationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, total } = useSelector((state) => state.users);
  const { items: packages } = useSelector((state) => state.packages);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const limit = 10;

  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  
  const [profilePreview, setProfilePreview] = React.useState(null);
  const [profileFile, setProfileFile] = React.useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = React.useState(null);
  const [idPhotoFile, setIdPhotoFile] = React.useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [selectedProfile, setSelectedProfile] = React.useState(null);

  const { register, handleSubmit, reset } = useForm();
  const { register: regAssign, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm();

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleIdPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdPhotoFile(file);
      setIdPhotoPreview(URL.createObjectURL(file));
    }
  };

  const loadData = React.useCallback(() => {
    dispatch(fetchUsers({
      page: currentPage,
      limit,
      search: searchTerm,
      role: 'member'
    }));
    dispatch(fetchPackages({ limit: 1000 }));
  }, [dispatch, currentPage, searchTerm]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRegisterStudent = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => { 
        if (val !== undefined && val !== null && val !== "") {
          formData.append(key, val); 
        }
      });
      formData.append('role', 'member');
      if (profileFile) formData.append('profilePicture', profileFile);
      if (idPhotoFile) formData.append('idPhoto', idPhotoFile);

      await dispatch(addUser(formData)).unwrap();
      toast.success('Student registered successfully!');
      closeRegisterModal();
      loadData();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
    reset();
    setProfilePreview(null);
    setProfileFile(null);
    setIdPhotoPreview(null);
    setIdPhotoFile(null);
  };

  const onAssignPackage = async (data) => {
    try {
      await dispatch(updateUser({ id: selectedUser._id, package: data.packageId })).unwrap();
      toast.success('Package assigned successfully!');
      setIsAssignModalOpen(false);
      resetAssign();
      loadData();
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

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="p-8">
            <LoadingSkeleton type="table" rows={8} />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="7" className="p-12">
            <ErrorState message={error} onRetry={loadData} />
          </td>
        </tr>
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="p-12">
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

    return items.filter(u => u.role === 'member').map((student) => {
      const status = getStatusInfo(student);
      const daysLeft = student.packageEndDate ? differenceInDays(parseISO(student.packageEndDate), new Date()) : 0;

      return (
        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg overflow-hidden bg-[#044343] text-white shadow-lg shadow-teal-900/10">
                {student.profilePicture ? (
                  <img src={student.profilePicture} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student.fullName?.charAt(0)
                )}
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
                <Coffee size={14} />
              </div>
              <span className="text-xs font-black text-slate-900">
                {student.assignedTable?.tableNumber || 'Unassigned'}
              </span>
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
              <button 
                onClick={() => { setSelectedProfile(student); setIsProfileModalOpen(true); }}
                className="p-2 text-slate-300 hover:text-[#044343] hover:bg-slate-100 rounded-xl transition-all"
              >
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
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Library Management</span>
            <ChevronRight size={10} />
            <span className="text-[#044343]">Student Console</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Registrations</h1>
          <p className="text-slate-500 font-medium">Capture details, verify identities and track student lifecycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={searchTerm}
              onChange={onSearchChange}
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
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Table</th>
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
        <Pagination 
          total={total}
          limit={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Register Student Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto custom-scrollbar"
            >
              <button onClick={closeRegisterModal} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-xl">
                <X size={24} />
              </button>
              
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900">Onboard New Student</h2>
                <p className="text-slate-500 font-medium mt-1">Capture comprehensive profile data for institutional records.</p>
              </div>

              <form onSubmit={handleSubmit(onRegisterStudent)} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Left Column: Photos */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Profile Photo *</label>
                      <div className="relative group mx-auto w-40 h-40">
                        <input type="file" onChange={handleProfileChange} className="hidden" id="profileImg" accept="image/*" />
                        <label htmlFor="profileImg" className="cursor-pointer block w-full h-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden hover:border-[#044343]/30 transition-all shadow-inner">
                          {profilePreview ? (
                            <img src={profilePreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                               <ImagePlus size={32} className="text-slate-300" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Profile</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Document Photo *</label>
                      <div className="relative group">
                        <input type="file" onChange={handleIdPhotoChange} className="hidden" id="idImg" accept="image/*" />
                        <label htmlFor="idImg" className="cursor-pointer block w-full aspect-[16/10] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden hover:border-[#044343]/30 transition-all">
                          {idPhotoPreview ? (
                            <img src={idPhotoPreview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                               <Upload size={32} className="text-slate-300" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload ID Card</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Fields */}
                  <div className="lg:col-span-2 space-y-10">
                    
                    {/* Section 1: Personal Details */}
                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="w-1.5 h-6 bg-[#044343] rounded-full"></span>
                         <h3 className="text-xs font-black text-[#044343] uppercase tracking-widest">Section 1: Personal Profile</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                          <input {...register('fullName', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="e.g. Owaisee Ahmed" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                          <input {...register('phone', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="+91 98765 43210" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                          <input {...register('email')} type="email" className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="owaiseeee@example.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                          <input {...register('dob')} type="date" className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-xs h-[50px]" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                          <select {...register('gender')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-sm h-[50px] appearance-none">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Address Details */}
                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="w-1.5 h-6 bg-[#044343] rounded-full"></span>
                         <h3 className="text-xs font-black text-[#044343] uppercase tracking-widest">Section 2: Residence Address</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Line 1 *</label>
                          <input {...register('addressLine1', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Street, Apartment..." />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address Line 2</label>
                          <input {...register('addressLine2')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Landmark, Area..." />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Town</label>
                          <input {...register('city')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Bangalore" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                          <input {...register('state')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Karnataka" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode *</label>
                          <input {...register('pincode', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="560001" />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Identity Verification */}
                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="w-1.5 h-6 bg-[#044343] rounded-full"></span>
                         <h3 className="text-xs font-black text-[#044343] uppercase tracking-widest">Section 3: Identity & Compliance</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Type *</label>
                          <select {...register('idType', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-sm h-[50px] appearance-none">
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Student ID">Student ID</option>
                            <option value="Passport">Passport</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Card Number *</label>
                          <input {...register('idNumber', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="XXXX-XXXX-XXXX" />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membership Package (Initial)</label>
                          <select {...register('package')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-sm h-[50px] appearance-none">
                            <option value="">Start with Free Plan</option>
                            {packages.map(pkg => (
                              <option key={pkg._id} value={pkg._id}>{pkg.name} — ₹{pkg.price} ({pkg.duration} Days)</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrator Notes</label>
                           <textarea {...register('notes')} rows="4" className="w-full bg-white border border-slate-200 rounded-3xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 resize-none text-sm font-medium" placeholder="Additional details, restrictions or preferences..."></textarea>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={closeRegisterModal} className="flex-1 bg-white border border-slate-200 text-slate-400 font-black py-5 rounded-3xl transition-all uppercase tracking-widest text-sm">
                    Discard Entry
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[2] bg-[#044343] text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Execute Member Registration'}
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Assign Package</h2>
                <p className="text-sm font-medium text-slate-500">To: {selectedUser?.fullName}</p>
              </div>

              <form onSubmit={handleAssignSubmit(onAssignPackage)} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Active Plan</label>
                  <select {...regAssign('packageId', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 text-xs font-bold appearance-none">
                    <option value="">Select a package...</option>
                    {packages.map(pkg => (
                      <option key={pkg._id} value={pkg._id}>{pkg.name} — {pkg.duration} Days (₹{pkg.price})</option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4">
                  <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-1" />
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-tight leading-relaxed">
                    UPDATING PACKAGE WILL OVERWRITE EXISTING MEMBERSHIP DATA AND RECALCULATE EXPIRY FROM TODAY.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Package Activation'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Profile Details Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-xl">
                <X size={24} />
              </button>
              
              <div className="flex flex-col md:flex-row gap-10">
                {/* Left: Quick Info */}
                <div className="md:w-1/3 space-y-8">
                  <div className="text-center">
                    <div className="w-40 h-40 rounded-[3rem] mx-auto bg-[#044343] p-1 border-4 border-white shadow-xl overflow-hidden">
                       <img src={selectedProfile.profilePicture || `https://i.pravatar.cc/150?u=${selectedProfile._id}`} className="w-full h-full object-cover rounded-[2.8rem]" alt={selectedProfile.fullName} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-6 tracking-tight line-clamp-1">{selectedProfile.fullName}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {getStatusInfo(selectedProfile).label}</p>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-teal-600 shadow-sm">
                          <Mail size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-xs font-bold text-slate-900 truncate">{selectedProfile.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-teal-600 shadow-sm">
                          <Phone size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                          <p className="text-xs font-bold text-slate-900">{selectedProfile.phone || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {selectedProfile.assignedTable ? (
                    <div className="bg-[#044343] rounded-[2rem] p-8 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden">
                       <Coffee className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Reserved Study Space</p>
                       <h3 className="text-3xl font-black mt-1">Table {selectedProfile.assignedTable.tableNumber}</h3>
                       <div className="mt-6 space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                             <Key size={12} /> Key: {selectedProfile.assignedTable.keyNumber || 'Digital Access'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                             <MapPin size={12} /> {selectedProfile.assignedTable.section}
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-8 text-center text-slate-400">
                       <Coffee size={32} className="mx-auto mb-2 opacity-50" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Desk Assigned</p>
                       <button 
                         onClick={() => { setIsProfileModalOpen(false); navigate('/app/tables'); }}
                         className="mt-4 text-[10px] font-black text-[#044343] hover:underline uppercase tracking-tighter"
                       >
                         Go to Tables Management
                       </button>
                    </div>
                  )}
                </div>

                {/* Right: Detailed Tabs/Info */}
                <div className="flex-1 space-y-10">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <ShieldCheck className="text-teal-600" size={16} />
                           <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identity Record</h3>
                         </div>
                         <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedProfile.idType}</p>
                            <p className="text-sm font-black text-slate-900 mt-1">{selectedProfile.idNumber}</p>
                            <div className="mt-4 h-32 rounded-xl overflow-hidden bg-white border border-slate-100">
                               {selectedProfile.idPhoto ? (
                                 <img src={selectedProfile.idPhoto} className="w-full h-full object-cover" alt="ID Document" />
                               ) : <div className="w-full h-full flex items-center justify-center text-slate-200"><Fingerprint size={48} /></div>}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <CreditCard className="text-teal-600" size={16} />
                           <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Plan</h3>
                         </div>
                         <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-[190px]">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Package</p>
                              <p className="text-lg font-black text-[#044343] mt-1">{selectedProfile.package?.name || 'Standard Membership'}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-200">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                               <p className="text-sm font-black text-slate-900">{selectedProfile.packageEndDate ? format(parseISO(selectedProfile.packageEndDate), 'MMMM dd, yyyy') : 'No active plan'}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <MapPin className="text-teal-600" size={16} />
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Full Residential Address</h3>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 gap-y-4">
                         <div className="col-span-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Street Address</p>
                            <p className="text-sm font-bold text-slate-900">{selectedProfile.addressLine1} {selectedProfile.addressLine2}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">City</p>
                            <p className="text-sm font-bold text-slate-900">{selectedProfile.city || 'N/A'}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pincode</p>
                            <p className="text-sm font-bold text-slate-900">{selectedProfile.pincode || 'N/A'}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <FileText className="text-teal-600" size={16} />
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Notes</h3>
                      </div>
                      <div className="bg-white rounded-2xl p-6 border border-slate-100">
                         <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                           {selectedProfile.notes || "No additional administrator notes recorded for this member."}
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
);
};

export default RegistrationList;
