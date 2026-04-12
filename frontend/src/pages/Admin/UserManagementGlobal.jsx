import React from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Globe,
  Shield,
  Mail,
  MoreVertical,
  Loader2
} from 'lucide-react';

const UserManagementGlobal = () => {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'super_admin', tenant: 'System' },
      { id: '2', name: 'Alice Smith', email: 'alice@citylib.com', role: 'librarian', tenant: 'City Library' },
      { id: '3', name: 'Bob Wilson', email: 'bob@unilib.com', role: 'member', tenant: 'University Lib' },
      { id: '4', name: 'Sarah Connor', email: 'sarah@techlib.io', role: 'librarian', tenant: 'Tech Library' },
    ];
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global User Registry</h1>
        <p className="text-slate-400 font-medium">Cross-tenant user monitoring and account management.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-teal-900/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or library..."
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#044343]/5"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 text-slate-400 font-bold hover:text-[#044343] transition-colors">
            <Filter size={20} />
            Advanced Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-10 py-6">User Profile</th>
                <th className="px-6 py-6">Security Role</th>
                <th className="px-6 py-6">Home Node</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-[#044343]" size={32} />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${user.id}`} alt="avatar" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'super_admin' ? 'bg-slate-900 text-white' :
                          user.role === 'librarian' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Globe size={14} className="text-slate-300" />
                        {user.tenant}
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Online</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 text-slate-300 hover:text-slate-600 rounded-xl transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementGlobal;
