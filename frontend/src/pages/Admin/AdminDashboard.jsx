import React from 'react';
import { Library, TrendingUp, Users, DollarSign, Clock, AlertCircle, Loader2, ShieldCheck, XCircle, Timer, ArrowUpRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGetAdminDashboardQuery } from '../../store/api/adminApi';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, sub, icon: Icon, color, bg }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={20} className={color} />
      </div>
      <ArrowUpRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
    <p className="text-[11px] font-bold text-slate-400 mt-1">{sub}</p>
  </div>
);

const getBadgeClass = (status) => {
  switch (status) {
    case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'trial': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'expired': return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'suspended': return 'bg-amber-50 text-amber-700 border-amber-100';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: adminData, isLoading, error, refetch } = useGetAdminDashboardQuery();
  const stats = adminData?.data;

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#044343]" size={28} />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading dashboard...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertCircle size={28} className="text-rose-500" />
      </div>
      <p className="text-slate-900 font-bold">{error.data?.message || 'Failed to load dashboard'}</p>
      <button onClick={() => refetch()} className="px-6 py-2.5 bg-[#044343] text-white rounded-xl font-bold text-sm">Retry</button>
    </div>
  );

  const cards = [
    { title: 'Total Libraries', value: stats?.totalLibraries ?? 0, sub: 'All tenants', icon: Library, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: 'Active', value: stats?.activeLibraries ?? 0, sub: 'Operational', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Trial Accounts', value: stats?.trialLibraries ?? 0, sub: 'Pending conversion', icon: Timer, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Expired', value: stats?.expiredLibraries ?? 0, sub: 'Needs follow-up', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`, sub: 'This month', icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, sub: 'All time', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Payments', value: stats?.pendingPayments || 0, sub: 'Awaiting settlement', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'New Sign-ups', value: stats?.newSignups ?? 0, sub: 'Last 30 days', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  const planColors = ['#044343', '#0E7490', '#6366F1', '#A855F7'];
  const planData = [
    { name: 'Trial', value: stats?.trialLibraries || 0 },
    { name: 'Starter', value: 10 },
    { name: 'Pro', value: 5 },
    { name: 'Enterprise', value: 2 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm font-medium text-slate-400 mt-0.5">Platform overview and real-time metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[11px] font-black text-emerald-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </div>
          <button onClick={() => refetch()} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900">Revenue Growth</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Monthly platform revenue</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.growthData || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="libraries" stroke="#6366F1" strokeWidth={2.5} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-7 flex flex-col">
          <h3 className="text-sm font-black text-slate-900">Plan Distribution</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5 mb-4">Libraries by subscription tier</p>
          <div className="flex-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={planData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {planData.map((_, index) => <Cell key={index} fill={planColors[index % planColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {planData.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: planColors[i] }} />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{p.name}</p>
                    <p className="text-xs font-black text-slate-900">{p.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-7">
          <h3 className="text-sm font-black text-slate-900">New Libraries</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5 mb-4">Monthly onboarding trend</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={stats?.growthData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="libraries" fill="#044343" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Recent Libraries</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Newest tenant accounts</p>
            </div>
            <button onClick={() => navigate('/admin/libraries')} className="text-[11px] font-black text-[#044343] uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-7 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Library</th>
                  <th className="py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Plan</th>
                  <th className="py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Status</th>
                  <th className="px-7 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(stats?.recentLibraries || []).length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-16">
                    <Library size={28} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No libraries yet</p>
                  </td></tr>
                ) : (
                  (stats?.recentLibraries || []).map((lib) => (
                    <tr key={lib._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-7 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#044343] text-white flex items-center justify-center font-black text-sm">{lib.name?.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">{lib.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">{lib.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-[11px] font-black text-[#044343] uppercase tracking-widest">{lib.plan}</span></td>
                      <td><span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider border ${getBadgeClass(lib.status)}`}>{lib.status}</span></td>
                      <td className="px-7 text-right text-[11px] font-bold text-slate-400">{lib.createdAt ? format(parseISO(lib.createdAt), 'dd MMM yyyy') : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
