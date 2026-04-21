import React from 'react';
import { useGetGlobalUsersQuery, useUpdateGlobalUserMutation } from '../../store/api/adminApi';
import { 
  Users, Search, Shield, ShieldCheck, ShieldAlert, 
  MoreHorizontal, Mail, Library, Loader2, User as UserIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GlobalUsers = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data: usersData, isLoading: loading, error } = useGetGlobalUsersQuery();
  const [updateUserMutation] = useUpdateGlobalUserMutation();

  const users = usersData?.data || [];

  const onUpdateRole = async (id, role) => {
    try {
      await updateUserMutation({ id, data: { role } }).unwrap();
      toast.success('User role updated successfully');
    } catch (err) {}
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return 'badge-danger';
      case 'admin': return 'badge-success';
      case 'librarian': return 'badge-info';
      case 'member': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96 input pl-10" 
            />
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
               <Users size={14} className="text-blue-500" />
               <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{users.length} Total Accounts</span>
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
              filteredUsers.map((user) => (
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
                    <button className="btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl text-slate-400 hover:text-slate-900"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalUsers;
