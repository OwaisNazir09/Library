import React from 'react';
import { useGetGlobalUsersQuery, useUpdateGlobalUserMutation } from '../../store/api/adminApi';
import {
  Users, Search, Shield, ShieldCheck, ShieldAlert,
  MoreHorizontal, Mail, Library, Loader2, User as UserIcon,
  X, CheckCircle2, AlertTriangle, UserCog, BadgeCheck,
  Headphones, DollarSign, Activity, Lock, UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../components/common/Pagination';

const GlobalUsers = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: usersData, isLoading: loading, error } = useGetGlobalUsersQuery({
    page,
    limit,
    search: debouncedSearch
  });
  const [updateUserMutation, { isLoading: isUpdating }] = useUpdateGlobalUserMutation();

  const users = usersData?.data || [];
  const total = usersData?.total || 0;

  const onUpdateUser = async (id, data) => {
    try {
      await updateUserMutation({ id, data }).unwrap();
      toast.success('User identity updated');
      // If we're updating the selected user in the modal, update local state
      if (selectedUser && selectedUser._id === id) {
         setSelectedUser(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-slate-900 text-white';
      case 'sales_admin': return 'bg-indigo-100 text-indigo-700';
      case 'support_admin': return 'bg-teal-100 text-teal-700';
      case 'librarian': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <Lock size={12} />;
      case 'sales_admin': return <DollarSign size={12} />;
      case 'support_admin': return <Headphones size={12} />;
      case 'librarian': return <Library size={12} />;
      default: return <UserIcon size={12} />;
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global User Authority</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Cross-tenant identity management and access orchestration.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 shadow-sm flex items-center gap-2">
            <Activity size={14} className="text-teal-500" />
            {total} ACTIVATED ACCOUNTS
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="Search users by name, email, or tenant..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-slate-50 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <button className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
              <UserPlus size={14} /> Add System User
           </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden bg-white border-transparent shadow-sm">
        <div className="overflow-x-auto">
          <table className="table-main">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5">User Profile</th>
                <th>System Role</th>
                <th>Affiliated Node</th>
                <th>Security Status</th>
                <th className="px-8 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin inline-block text-slate-200" size={32} /></td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" alt="" /> : <UserIcon size={18} />}
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-slate-900 leading-none">{user.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-1.5 flex items-center gap-1.5 uppercase tracking-tighter">
                            <Mail size={12} className="text-slate-200" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Library size={14} className="text-slate-300" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{user.tenantId?.name || 'PLATFORM_CORE'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {user.status === 'approved' ? (
                          <BadgeCheck size={16} className="text-emerald-500" />
                        ) : (
                          <ShieldAlert size={16} className="text-amber-500" />
                        )}
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-8 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center ml-auto"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30">
            <Pagination
              total={total}
              limit={limit}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="px-8 pt-8 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Governance</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Global Authority Management</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-8 pb-8 space-y-6">
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#044343] font-black text-xl border border-slate-200 shadow-sm">
                    {selectedUser?.fullName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-black text-slate-900 truncate leading-none">{selectedUser?.fullName}</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-2 truncate uppercase tracking-widest">{selectedUser?.email}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role Assignment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'super_admin', label: 'Super Admin', icon: Lock },
                        { id: 'sales_admin', label: 'Sales Admin', icon: DollarSign },
                        { id: 'support_admin', label: 'Support Admin', icon: Headphones },
                        { id: 'librarian', label: 'Librarian', icon: Library }
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => onUpdateUser(selectedUser._id, { role: role.id })}
                          disabled={isUpdating}
                          className={`px-4 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${selectedUser.role === role.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <role.icon size={14} className={selectedUser.role === role.id ? 'text-white' : 'text-slate-300'} />
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Life-Cycle</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'approved', label: 'Active', color: 'emerald' },
                        { id: 'pending', label: 'Pending', color: 'amber' },
                        { id: 'suspended', label: 'Revoked', color: 'rose' }
                      ].map((status) => (
                        <button
                          key={status.id}
                          onClick={() => onUpdateUser(selectedUser._id, { status: status.id })}
                          disabled={isUpdating}
                          className={`px-3 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${selectedUser.status === status.id
                            ? (status.id === 'approved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : status.id === 'suspended' ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-amber-500 text-white border-amber-500 shadow-lg')
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100/50 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                    <Shield size={18} className="text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
                    Identity changes are logged globally. Permissions are propagated immediately across all platform endpoints.
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                >
                  Commit & Exit Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalUsers;
