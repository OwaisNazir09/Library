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
        toast.success('Student updated');
      } else {
        await addUserMutation(formData).unwrap();
        toast.success('Student registered');
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
      toast.success('Package assigned successfully');
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
    if (!user.packageEndDate) return { label: 'No Plan', color: 'badge-neutral' };
    const isExpired = !isAfter(parseISO(user.packageEndDate), new Date());
    if (isExpired) return { label: 'Expired', color: 'badge-danger' };
    return { label: 'Active', color: 'badge-success' };
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) return <LoadingSkeleton type="table" rows={10} />;
    if (error) return <ErrorState message="Error loading members" onRetry={refetch} />;
    if (!items.length) return <EmptyState title="No students found" icon={UserPlus} onAction={() => setIsRegisterModalOpen(true)} actionLabel="Add Student" />;

    return items.map((student) => {
      const status = getStatusInfo(student);
      const daysLeft = student.packageEndDate ? differenceInDays(parseISO(student.packageEndDate), new Date()) : 0;

      return (
        <tr key={student._id}>
          <td className="px-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#044343] font-bold text-xs overflow-hidden border border-teal-100">
                {student.profilePicture ? (
                  <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : student.fullName?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{student.fullName}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">ID: {student._id.substring(18)}</p>
              </div>
            </div>
          </td>
          <td className="text-[12px] font-medium text-slate-600">
            <p>{student.email}</p>
            <p className="text-slate-400 text-[10px]">{student.phone || '-'}</p>
          </td>
          <td>
            <div className="flex items-center gap-1.5">
              <Coffee size={12} className="text-slate-300" />
              <span className="text-[12px] font-semibold text-slate-700">{student.assignedTable?.tableNumber || '-'}</span>
            </div>
          </td>
          <td>
            <div className="flex items-center gap-1.5">
              <CreditCard size={12} className="text-slate-300" />
              <span className="text-[12px] font-semibold text-slate-700 truncate max-w-[100px]">{student.package?.name || 'Free'}</span>
            </div>
          </td>
          <td className="text-[12px] font-medium text-slate-500">
            {student.packageEndDate ? format(parseISO(student.packageEndDate), 'dd MMM yyyy') : '-'}
          </td>
          <td>
            <span className={`badge ${status.color} lowercase`}>{status.label}</span>
          </td>
          <td className="px-5 text-right">
            <div className="flex items-center justify-end gap-1.5">
              {activeTab === 'pending' ? (
                <>
                  <button onClick={() => approveUser(student._id)} className="btn btn-ghost btn-sm text-emerald-600">Approve</button>
                  <button onClick={() => handleReject(student._id)} className="btn btn-ghost btn-sm text-rose-500">Reject</button>
                </>
              ) : (
                <>
                  <button onClick={() => openEditModal(student)} className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-900">Edit</button>
                  <button onClick={() => openAssignModal(student)} className="btn btn-ghost btn-sm text-slate-400 hover:text-teal-600">Plan</button>
                  <button onClick={() => { setSelectedProfile(student); setIsProfileModalOpen(true); }} className="btn btn-ghost btn-sm w-7 h-7 p-0"><MoreHorizontal size={14} /></button>
                </>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Members List</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage library memberships and applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
            />
          </div>
          <button onClick={() => { setSelectedUser(null); setIsRegisterModalOpen(true); reset({}); setProfilePreview(null); setIdPhotoPreview(null); }} className="btn btn-primary btn-md">
            <UserPlus size={16} />
            <span className="hidden sm:inline ml-1.5">New Member</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 border-b border-slate-100">
        <button onClick={() => { setActiveTab('approved'); setCurrentPage(1); }} className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'approved' ? 'text-[#044343]' : 'text-slate-400 hover:text-slate-600'}`}>
          Approved Members
          {activeTab === 'approved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#044343]" />}
        </button>
        <button onClick={() => { setActiveTab('pending'); setCurrentPage(1); }} className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${activeTab === 'pending' ? 'text-[#044343]' : 'text-slate-400 hover:text-slate-600'}`}>
          Applications
          {pendingCount > 0 && <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#044343]" />}
        </button>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Student</th>
              <th>Contact</th>
              <th>Desk</th>
              <th>Plan</th>
              <th>Expiry</th>
              <th>Status</th>
              <th className="text-right px-5">Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between no-print pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {items.length} of {total} records</p>
        <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      {/* Modals are updated to use global modal classes */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-4xl">
              <div className="modal-h">
                <h2 className="text-sm font-bold">{selectedUser ? 'Edit Member Record' : 'Register New Member'}</h2>
                <button onClick={closeRegisterModal} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onRegisterStudent)} className="flex flex-col overflow-hidden">
                <div className="modal-b max-h-[75vh] overflow-y-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-4">
                      <div className="space-y-1.5">
                        <label className="label">Profile Photo</label>
                        <label className="cursor-pointer block w-32 h-32 mx-auto rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:bg-slate-100 transition-all flex items-center justify-center">
                          <input type="file" onChange={handleProfileChange} className="hidden" />
                          {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <ImagePlus size={24} className="text-slate-300" />}
                        </label>
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">ID Photo</label>
                        <label className="cursor-pointer block w-full aspect-video rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden hover:bg-slate-100 transition-all flex items-center justify-center">
                          <input type="file" onChange={handleIdPhotoChange} className="hidden" />
                          {idPhotoPreview ? <img src={idPhotoPreview} className="w-full h-full object-cover" /> : <Upload size={20} className="text-slate-300" />}
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1.5">
                          <label className="label">Full Name *</label>
                          <input {...register('fullName', { required: true })} className="input" placeholder="e.g. John Doe" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Phone *</label>
                          <input {...register('phone', { required: true })} className="input" placeholder="+91..." />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Email *</label>
                          <input {...register('email', { required: true })} type="email" className="input" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">DOB</label>
                          <input {...register('dob')} type="date" className="input" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Gender</label>
                          <select {...register('gender')} className="input"><option value="Male">Male</option><option value="Female">Female</option></select>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1.5"><label className="label">Address Line 1</label><input {...register('addressLine1')} className="input" /></div>
                        <div className="space-y-1.5"><label className="label">City</label><input {...register('city')} className="input" /></div>
                        <div className="space-y-1.5"><label className="label">Pincode</label><input {...register('pincode')} className="input" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={closeRegisterModal} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-md px-8 min-w-[120px]">
                    {isAdding || isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Save Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isAssignModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-md">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Manage Membership Plan</h2>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleAssignSubmit(onAssignPackage)}>
                <div className="modal-b space-y-5">
                   <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Member</p>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#044343] font-bold text-xs border border-slate-200">
                           {selectedUser?.fullName?.charAt(0)}
                         </div>
                         <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-none">{selectedUser?.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">Current: {selectedUser?.package?.name || 'No Plan'}</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="label">Select New Plan</label>
                      <select {...regAssign('packageId', { required: true })} className="input h-[38px] font-bold">
                        <option value="">Choose a package...</option>
                        {packages.map(p => (
                          <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>
                        ))}
                      </select>
                   </div>
                   <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-3">
                      <AlertTriangle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-700 font-medium leading-relaxed">Changing the plan will reset the membership expiry date based on the new package duration.</p>
                   </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary btn-md">Cancel</button>
                  <button type="submit" disabled={isAssigning} className="btn btn-primary btn-md min-w-[120px]">
                    {isAssigning ? <Loader2 size={16} className="animate-spin" /> : 'Assign Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isProfileModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-2xl">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Member Profile Overview</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <div className="modal-b space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
                       {selectedProfile?.profilePicture ? <img src={selectedProfile.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-2xl">{selectedProfile?.fullName?.charAt(0)}</div>}
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-bold text-slate-900 tracking-tight">{selectedProfile?.fullName}</h3>
                       <p className="text-[13px] text-slate-500 font-medium mt-1">{selectedProfile?.email}</p>
                       <div className="flex items-center gap-3 mt-3">
                          <span className={`badge ${getStatusInfo(selectedProfile || {}).color} lowercase`}>{getStatusInfo(selectedProfile || {}).label}</span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{selectedProfile?.gender}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p><p className="text-[13px] font-bold text-slate-700">{selectedProfile?.phone || 'Not provided'}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Member Since</p><p className="text-[13px] font-bold text-slate-700">{selectedProfile?.createdAt ? format(parseISO(selectedProfile.createdAt), 'dd MMMM yyyy') : '-'}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Identity ID</p><p className="text-[13px] font-bold text-slate-700">#{selectedProfile?._id?.substring(18)}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Plan</p><p className="text-[13px] font-bold text-slate-900">{selectedProfile?.package?.name || 'No Active Plan'}</p></div>
                    <div className="col-span-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Address</p><p className="text-[13px] font-bold text-slate-700 leading-relaxed">{[selectedProfile?.addressLine1, selectedProfile?.city, selectedProfile?.pincode].filter(Boolean).join(', ')}</p></div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification Photo</p>
                       <div className="aspect-video bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
                          {selectedProfile?.idPhoto ? <img src={selectedProfile.idPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase">No ID Uploaded</div>}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="modal-f">
                <button onClick={() => setIsProfileModalOpen(false)} className="btn btn-secondary btn-md px-8">Close</button>
                <button onClick={() => { setIsProfileModalOpen(false); openEditModal(selectedProfile); }} className="btn btn-primary btn-md px-8">Edit Details</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationList;
