import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, addUser } from '../../store/slices/userSlice';
import { Search, Plus, MoreHorizontal, Mail, Phone, Shield, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { Users as UsersIcon } from 'lucide-react';

const UserList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.users);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadUsers = React.useCallback(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onAddUser = async (data) => {
    const result = await dispatch(addUser(data));
    if (addUser.fulfilled.match(result)) {
      toast.success('Member added successfully!');
      setIsModalOpen(false);
      reset();
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      const result = await dispatch(deleteUser(id));
      if (deleteUser.fulfilled.match(result)) {
        toast.success('Member deleted');
      }
    }
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="p-8">
            <LoadingSkeleton type="table" rows={6} />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="5" className="p-12">
            <ErrorState message={error} onRetry={loadUsers} />
          </td>
        </tr>
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="p-12">
            <EmptyState 
              title="No Members Found" 
              message="Your library doesn't have any members registered yet."
              onAction={() => setIsModalOpen(true)}
              actionLabel="Add First Member"
              icon={UsersIcon}
            />
          </td>
        </tr>
      );
    }

    return items.map((member) => (
      <tr key={member.id || member._id} className="hover:bg-slate-50/50 transition-colors group">
        <td className="px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-teal-50 text-[#044343] rounded-2xl flex items-center justify-center font-bold text-lg">
              {(member.fullName || member.name)?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">{member.fullName || member.name}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">ID: {member.id || member._id?.substring(0, 8)}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Mail size={12} className="text-slate-300" />
              {member.email}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Phone size={12} className="text-slate-300" />
              {member.phone || 'N/A'}
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            member.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 
            member.role === 'librarian' ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'
          }`}>
            <Shield size={10} />
            {member.role}
          </span>
        </td>
        <td className="px-6 py-5">
          <span className="text-xs font-bold text-[#044343] bg-teal-50 px-2 py-1 rounded-lg">
            {member.subdomain || 'primary'}
          </span>
        </td>
        <td className="px-8 py-5 text-right">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onDelete(member.id || member._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
              <X size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Library Members</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all registered library users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm transition-all"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-900/10 active:scale-95 transition-all">
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Member</th>
                <th className="px-6 py-5">Contact Details</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Subdomain</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add Member Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">Add New Member</h2>
            <form onSubmit={handleSubmit(onAddUser)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input {...register('name')} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input {...register('email')} type="email" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input {...register('password')} type="password" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select {...register('role')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 text-xs font-bold">
                    <option value="member">Member</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-teal-900/10 active:scale-95 transition-all">
                Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserList;
