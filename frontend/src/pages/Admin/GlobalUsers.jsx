import React from 'react';
import { useGetGlobalUsersQuery, useUpdateGlobalUserMutation } from '../../store/api/adminApi';
import {
  Users, Search, Shield, ShieldCheck, ShieldAlert,
  MoreHorizontal, Mail, Library, Loader2, User as UserIcon,
  X, CheckCircle2, AlertTriangle, UserCog
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
      toast.success('User updated successfully');
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return 'badge-danger';
      case 'librarian': return 'badge-info';
      case 'member': return 'badge-neutral';
      default: return 'badge-neutral';
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
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global User Authority</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Cross-tenant user management and access control.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-96 input pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
            <Users size={14} className="text-blue-500" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{total} Total Accounts</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">User Profile</th>
              <th>System Role</th>
              <th>Affiliated Library</th>
              <th>Verification</th>
              <th className="px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin inline-block text-[#044343]" size={32} /></td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 leading-none">{user.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>{user.role}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Library size={14} className="text-slate-300" />
                      <span className="text-[13px] font-bold text-slate-700">{user.tenantId?.name || 'Platform Core'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {user.status === 'approved' ? (
                        <ShieldCheck size={16} className="text-emerald-500" />
                      ) : (
                        <ShieldAlert size={16} className="text-amber-500" />
                      )}
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 text-right">
                    <button
                      onClick={() => openEditModal(user)}
                      className="btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl text-slate-400 hover:text-slate-900"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <Pagination
            total={total}
            limit={limit}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-panel w-full max-w-md"
            >
              <div className="modal-h">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Manage Authority</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Adjust user roles and platform access.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-b space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#044343] font-black text-lg border border-slate-200 shadow-sm">
                    {selectedUser?.fullName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 truncate leading-none">{selectedUser?.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-bold mt-2 truncate uppercase tracking-widest">{selectedUser?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">System Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['super_admin', 'librarian', 'member'].map((role) => (
                        <button
                          key={role}
                          onClick={() => onUpdateUser(selectedUser._id, { role })}
                          disabled={isUpdating}
                          className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedUser.role === role
                            ? 'bg-[#044343] text-white border-[#044343] shadow-md'
                            : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                          {selectedUser.role === role && <CheckCircle2 size={12} />}
                          {role.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['approved', 'pending', 'suspended'].map((status) => (
                        <button
                          key={status}
                          onClick={() => onUpdateUser(selectedUser._id, { status })}
                          disabled={isUpdating}
                          className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedUser.status === status
                            ? (status === 'approved' ? 'bg-emerald-500 text-white border-emerald-500' : status === 'suspended' ? 'bg-rose-500 text-white border-rose-500' : 'bg-amber-500 text-white border-amber-500')
                            : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                          {selectedUser.status === status && <CheckCircle2 size={12} />}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-blue-600" />
                  </div>
                  <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
                    Changing global roles affects cross-tenant permissions. Ensure you have proper authorization.
                  </p>
                </div>
              </div>

              <div className="modal-f">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-md w-full"
                >
                  Close Manager
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
