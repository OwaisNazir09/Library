import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsersQuery, useDeleteUserMutation, useAddUserMutation, useUpdateUserMutation, useApproveUserMutation, useRejectUserMutation } from '../../store/api/usersApi';
import { useGetPackagesQuery, useAssignPackageMutation } from '../../store/api/membershipApi';
import {
  Search, Plus, MoreHorizontal, Mail, Phone, Coffee, X, UserPlus, Calendar, Clock,
  ShieldCheck, CreditCard, AlertTriangle, ChevronRight, ImagePlus, MapPin, Fingerprint,
  FileText, Upload, ArrowRight, Key, UserCheck, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { useSubscription } from '../../hooks/useSubscription';

const RegistrationList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const limit = 10;
  const [activeTab, setActiveTab] = React.useState('approved');

  const { data: usersData, isLoading: loading, error, refetch } = useGetUsersQuery({
    page: currentPage,
    limit,
    search: searchTerm,
    role: 'member',
    ...(activeTab === 'pending' ? { status: 'pending' } : { 'status[ne]': 'pending' })
  });

  const { data: pendingStats } = useGetUsersQuery({
    role: 'member',
    status: 'pending',
    limit: 1
  });

  const { data: packagesData } = useGetPackagesQuery({ limit: 1000 });
  const [addUserMutation, { isLoading: isAdding }] = useAddUserMutation();
  const [assignPackageMutation, { isLoading: isAssigning }] = useAssignPackageMutation();
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();
  const [updateUserMutation, { isLoading: isUpdating }] = useUpdateUserMutation();

  const items = usersData?.data?.users || [];
  const total = usersData?.total || usersData?.results || 0;
  const pendingCount = pendingStats?.total || 0;
  const packages = packagesData?.data?.packages || packagesData?.data || [];

  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const [profilePreview, setProfilePreview] = React.useState(null);
  const [profileFile, setProfileFile] = React.useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = React.useState(null);
  const [idPhotoFile, setIdPhotoFile] = React.useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [selectedProfile, setSelectedProfile] = React.useState(null);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this application?')) {
      try {
        await rejectUser(id).unwrap();
        toast.success('Application rejected');
      } catch (err) { }
    }
  };

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

  const onRegisterStudent = async (data) => {
    try {
      const formData = new FormData();
      const excludedFields = ['role', 'profilePicture', 'idPhoto'];

      Object.entries(data).forEach(([key, val]) => {
        if (!excludedFields.includes(key) && val !== undefined && val !== null && val !== "") {
          formData.append(key, val);
        }
      });

      formData.set('role', 'member');
      if (profileFile) formData.set('profilePicture', profileFile);
      if (idPhotoFile) formData.set('idPhoto', idPhotoFile);

      if (selectedUser) {
        await updateUserMutation({ id: selectedUser._id, data: formData }).unwrap();
        toast.success('Student record updated');
      } else {
        await addUserMutation(formData).unwrap();
        toast.success('Student successfully registered');
      }
      closeRegisterModal();
    } catch (err) { }
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
      await assignPackageMutation({ 
        userId: selectedUser._id, 
        packageId: data.packageId 
      }).unwrap();
      toast.success('Membership plan assigned');
      setIsAssignModalOpen(false);
      resetAssign();
      refetch();
    } catch (err) {}
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    const userData = { ...user };
    if (user.package && typeof user.package === 'object') userData.package = user.package._id;
    if (user.dob) userData.dob = format(parseISO(user.dob), 'yyyy-MM-dd');
    reset(userData);
    setProfilePreview(user.profilePicture);
    setIdPhotoPreview(user.idPhoto);
    setIsRegisterModalOpen(true);
  };

  const getStatusInfo = (user) => {
    if (user.status === 'pending') return { label: 'Pending', color: 'badge-warning' };
    if (!user.packageEndDate) return { label: 'Inactive', color: 'badge-neutral' };
    const isExpired = !isAfter(parseISO(user.packageEndDate), new Date());
    if (isExpired) return { label: 'Expired', color: 'badge-danger' };
    return { label: 'Active', color: 'badge-success' };
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) return <LoadingSkeleton type="table" rows={10} />;
    if (error) return <ErrorState message="Error loading members" onRetry={refetch} />;
    if (!items.length) return <EmptyState title="No members found" icon={UserPlus} onAction={() => setIsRegisterModalOpen(true)} actionLabel="Register Member" />;

    return items.map((student) => {
      const status = getStatusInfo(student);
      return (
        <tr key={student._id}>
          <td className="px-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#044343] font-bold text-sm overflow-hidden border border-teal-100/50 shadow-sm">
                {student.profilePicture ? (
                  <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : student.fullName?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-slate-900 truncate leading-none">{student.fullName}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5 truncate uppercase tracking-widest">ID: {student._id.substring(18)}</p>
              </div>
            </div>
          </td>
          <td className="text-[13px] font-bold text-slate-600">
            <div className="flex flex-col gap-1">
               <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {student.email}</p>
               <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {student.phone || 'N/A'}</p>
            </div>
          </td>
          <td>
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg w-fit">
              <Coffee size={12} className="text-[#044343]" />
              <span className="text-[12px] font-bold text-[#044343]">{student.assignedTable?.tableNumber || '-'}</span>
            </div>
          </td>
          <td>
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-slate-300" />
              <span className="text-[13px] font-bold text-slate-700 truncate max-w-[120px]">{student.package?.name || 'No Plan'}</span>
            </div>
          </td>
          <td className="text-[13px] font-bold text-slate-500">
            {student.packageEndDate ? format(parseISO(student.packageEndDate), 'dd MMM yyyy') : 'N/A'}
          </td>
          <td>
            <span className={`badge ${status.color}`}>{status.label}</span>
          </td>
          <td className="px-6 text-right">
            <div className="flex items-center justify-end gap-2">
              {activeTab === 'pending' ? (
                <>
                  <button onClick={() => approveUser(student._id)} className="btn btn-primary btn-sm h-8 px-4 rounded-lg text-[10px] uppercase font-black">Approve</button>
                  <button onClick={() => handleReject(student._id)} className="btn btn-ghost btn-sm h-8 px-3 rounded-lg text-[10px] uppercase font-black text-rose-500">Reject</button>
                </>
              ) : (
                <>
                  <button onClick={() => openEditModal(student)} className="btn btn-secondary btn-sm w-9 h-9 p-0 rounded-xl"><MoreHorizontal size={16} /></button>
                  <button onClick={() => openAssignModal(student)} className="btn btn-secondary btn-sm h-8 px-3 rounded-lg text-[10px] uppercase font-black text-teal-600">Plan</button>
                  <button onClick={() => { setSelectedProfile(student); setIsProfileModalOpen(true); }} className="btn btn-ghost btn-sm w-8 h-8 p-0 rounded-lg"><ChevronRight size={18} /></button>
                </>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  const { isExpired } = useSubscription();

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Registry</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Manage memberships and service applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter by name, ID..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-64 input pl-10"
            />
          </div>
          <button 
            onClick={() => { if (!isExpired) { setSelectedUser(null); setIsRegisterModalOpen(true); reset({}); setProfilePreview(null); setIdPhotoPreview(null); } }} 
            className={`btn btn-primary btn-md px-6 ${isExpired ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            title={isExpired ? 'Subscription Expired' : ''}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Register Student</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8 border-b border-slate-100">
        <button onClick={() => { setActiveTab('approved'); setCurrentPage(1); }} className={`pb-3.5 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'approved' ? 'text-[#044343]' : 'text-slate-400 hover:text-slate-600'}`}>
          Approved Members
          {activeTab === 'approved' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#044343] rounded-t-full" />}
        </button>
        <button onClick={() => { setActiveTab('pending'); setCurrentPage(1); }} className={`pb-3.5 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === 'pending' ? 'text-[#044343]' : 'text-slate-400 hover:text-slate-600'}`}>
          Applications
          {pendingCount > 0 && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount}</span>}
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#044343] rounded-t-full" />}
        </button>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">Identity</th>
              <th>Contact</th>
              <th>Desk</th>
              <th>Subscription</th>
              <th>Expiry</th>
              <th>Status</th>
              <th className="text-right px-6">Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between no-print pt-2">
        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Showing {items.length} of {total} records</p>
        <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-panel w-full max-w-4xl">
              <div className="modal-h">
                <div>
                   <h2 className="text-lg font-bold text-slate-900">{selectedUser ? 'Modify Record' : 'Onboard Member'}</h2>
                   <p className="text-xs text-slate-400 font-medium mt-1">Complete the identity profile for the student.</p>
                </div>
                <button onClick={closeRegisterModal} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit(onRegisterStudent)} className="flex flex-col overflow-hidden">
                <div className="modal-b max-h-[70vh] overflow-y-auto space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-1 space-y-6">
                      <div className="space-y-3 text-center">
                        <label className="label text-center">Profile Avatar</label>
                        <label className="cursor-pointer block w-32 h-32 mx-auto rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:bg-slate-100 hover:border-teal-300 transition-all flex items-center justify-center shadow-inner group">
                          <input type="file" onChange={handleProfileChange} className="hidden" />
                          {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2"><ImagePlus size={24} className="text-slate-300 group-hover:text-teal-400" /><span className="text-[9px] font-bold text-slate-400 uppercase">Upload</span></div>}
                        </label>
                      </div>
                      <div className="space-y-3">
                        <label className="label">Verification ID</label>
                        <label className="cursor-pointer block w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:bg-slate-100 hover:border-teal-300 transition-all flex items-center justify-center group shadow-inner">
                          <input type="file" onChange={handleIdPhotoChange} className="hidden" />
                          {idPhotoPreview ? <img src={idPhotoPreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2"><Upload size={20} className="text-slate-300 group-hover:text-teal-400" /><span className="text-[9px] font-bold text-slate-400 uppercase">Government ID</span></div>}
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                           <Fingerprint size={16} className="text-[#044343]" />
                           <span className="text-[11px] font-bold text-[#044343] uppercase tracking-widest">Primary Identity</span>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="col-span-2 space-y-2">
                            <label className="label">Legal Full Name</label>
                            <input {...register('fullName', { required: true })} className="input" placeholder="Enter student's full name" />
                          </div>
                          <div className="space-y-2">
                            <label className="label">Contact Number</label>
                            <input {...register('phone', { required: true })} className="input" placeholder="+91 00000 00000" />
                          </div>
                          <div className="space-y-2">
                            <label className="label">Email Address</label>
                            <input {...register('email', { required: true })} type="email" className="input" placeholder="student@example.com" />
                          </div>
                          <div className="space-y-2">
                            <label className="label">Date of Birth</label>
                            <input {...register('dob')} type="date" className="input" />
                          </div>
                          <div className="space-y-2">
                            <label className="label">Gender Identity</label>
                            <select {...register('gender')} className="input cursor-pointer"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                           <MapPin size={16} className="text-[#044343]" />
                           <span className="text-[11px] font-bold text-[#044343] uppercase tracking-widest">Residential Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="col-span-2 space-y-2"><label className="label">Local Address</label><input {...register('addressLine1')} className="input" placeholder="House no, Street, Locality" /></div>
                          <div className="space-y-2"><label className="label">City / District</label><input {...register('city')} className="input" /></div>
                          <div className="space-y-2"><label className="label">Postal Pincode</label><input {...register('pincode')} className="input" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={closeRegisterModal} className="btn btn-secondary btn-md px-8">Cancel</button>
                  <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-md px-10 min-w-[160px]">
                    {isAdding || isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Secure Registration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isAssignModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-panel w-full max-w-md">
              <div className="modal-h">
                <div>
                   <h2 className="text-lg font-bold text-slate-900">Manage Service Plan</h2>
                   <p className="text-xs text-slate-400 font-medium mt-1">Assign or upgrade library membership.</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAssignSubmit(onAssignPackage)}>
                <div className="modal-b space-y-6">
                   <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#044343] font-black text-lg border border-slate-200 shadow-sm">
                        {selectedUser?.fullName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                         <p className="text-[14px] font-bold text-slate-900 truncate leading-none">{selectedUser?.fullName}</p>
                         <p className="text-[11px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Active: {selectedUser?.package?.name || 'No Base Plan'}</p>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="label">Subscription Tier</label>
                      <select {...regAssign('packageId', { required: true })} className="input h-[46px] font-bold cursor-pointer">
                        <option value="">Select a plan...</option>
                        {packages.map(p => (
                          <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>
                        ))}
                      </select>
                   </div>
                   <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                         <AlertTriangle size={16} className="text-blue-600" />
                      </div>
                      <p className="text-[12px] text-blue-700 font-medium leading-relaxed">Assigning a new tier will reset the membership cycle and desk allocation timestamps.</p>
                   </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary btn-md px-8">Dismiss</button>
                  <button type="submit" disabled={isAssigning} className="btn btn-primary btn-md px-10 min-w-[160px]">
                    {isAssigning ? <Loader2 size={18} className="animate-spin" /> : 'Apply Tier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isProfileModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-panel w-full max-w-2xl">
              <div className="modal-h">
                <div>
                   <h2 className="text-lg font-bold text-slate-900">Member Dossier</h2>
                   <p className="text-xs text-slate-400 font-medium mt-1">Comprehensive profile overview.</p>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <div className="modal-b space-y-10">
                 <div className="flex items-center gap-8">
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 border border-slate-200 overflow-hidden shadow-lg p-1">
                       <div className="w-full h-full rounded-[1.75rem] overflow-hidden bg-white">
                          {selectedProfile?.profilePicture ? <img src={selectedProfile.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-4xl">{selectedProfile?.fullName?.charAt(0)}</div>}
                       </div>
                    </div>
                    <div className="flex-1">
                       <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{selectedProfile?.fullName}</h3>
                       <p className="text-[14px] text-slate-500 font-medium mt-3 flex items-center gap-2"><Mail size={14} className="text-slate-300" /> {selectedProfile?.email}</p>
                       <div className="flex items-center gap-4 mt-5">
                          <span className={`badge ${getStatusInfo(selectedProfile || {}).color}`}>{getStatusInfo(selectedProfile || {}).label}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{selectedProfile?.gender || 'Unspecified'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    <div><p className="label">Contact Endpoint</p><p className="text-[14px] font-bold text-slate-700 flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {selectedProfile?.phone || 'Missing'}</p></div>
                    <div><p className="label">Enrolled Since</p><p className="text-[14px] font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} className="text-slate-300" /> {selectedProfile?.createdAt ? format(parseISO(selectedProfile.createdAt), 'dd MMMM yyyy') : '-'}</p></div>
                    <div><p className="label">System Identity</p><p className="text-[14px] font-bold text-slate-700 flex items-center gap-2"><Fingerprint size={14} className="text-slate-300" /> #{selectedProfile?._id?.substring(18).toUpperCase()}</p></div>
                    <div><p className="label">Active Subscription</p><p className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><CreditCard size={14} className="text-[#044343]" /> {selectedProfile?.package?.name || 'Manual Access'}</p></div>
                    <div className="col-span-2"><p className="label">Registered Address</p><p className="text-[14px] font-bold text-slate-700 leading-relaxed flex items-start gap-2"><MapPin size={14} className="text-slate-300 mt-1 shrink-0" /> {[selectedProfile?.addressLine1, selectedProfile?.city, selectedProfile?.pincode].filter(Boolean).join(', ')}</p></div>
                 </div>

                 <div className="space-y-4">
                    <p className="label">Identity Documents</p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="aspect-video bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner group relative">
                          {selectedProfile?.idPhoto ? <img src={selectedProfile.idPhoto} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 font-bold text-[10px] uppercase tracking-widest">No Document Uploaded</div>}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><FileText className="text-white" size={32} /></div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="modal-f">
                <button onClick={() => setIsProfileModalOpen(false)} className="btn btn-secondary btn-md px-8">Close Dossier</button>
                <button onClick={() => { setIsProfileModalOpen(false); openEditModal(selectedProfile); }} className="btn btn-primary btn-md px-8">Modify Access</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationList;
