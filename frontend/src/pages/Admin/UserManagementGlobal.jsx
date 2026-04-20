import React from 'react';
import { useGetUsersQuery } from '../../store/api/usersApi';
import {
  Users, Search, Filter, Globe, Shield, Mail, MoreVertical, Loader2
} from 'lucide-react';

const UserManagementGlobal = () => {
  const { data: usersData, isLoading: loading, error, refetch } = useGetUsersQuery({ limit: 1000 });
  const users = usersData?.data?.users || usersData?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Global User Registry</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Cross-tenant user monitoring and platform administration</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search across all tenants..."
              className="w-64 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
            />
          </div>
          <button className="btn btn-secondary btn-md">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">User Profile</th>
              <th>Security Role</th>
              <th>Home Node (Tenant)</th>
              <th>Status</th>
              <th className="px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <p className="text-slate-500 font-bold mb-4">{error.data?.message || 'Error loading platform users'}</p>
                  <button onClick={() => refetch()} className="btn btn-primary btn-md">Retry</button>
                </td>
              </tr>
            ) : loading ? (
              <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin inline-block text-teal-600" size={24} /></td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-[#044343] overflow-hidden border border-teal-100 text-[11px]">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          user.fullName?.charAt(0) || '?'
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-none">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 lowercase truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge lowercase flex items-center gap-1 w-fit ${user.role === 'super_admin' ? 'badge-neutral' :
                        user.role === 'librarian' ? 'badge-info' : 'badge-neutral'
                      }`}>
                      <Shield size={10} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                     <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                        <Globe size={12} className="text-teal-600" />
                        {user.tenantName || 'Platform'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">ID: {user.tenantId?.substring(18) || 'GLOBAL'}</span>
                     </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active</span>
                    </div>
                  </td>
                  <td className="px-5 text-right">
                    <button className="btn btn-ghost btn-sm w-8 h-8 p-0">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!loading && !users.length && <tr><td colSpan="5" className="p-20 text-center text-slate-400 italic text-xs">No users registered on the platform.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementGlobal;
