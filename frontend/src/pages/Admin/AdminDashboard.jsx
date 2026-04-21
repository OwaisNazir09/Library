import React from 'react';
import {
  Library, TrendingUp, Users, CreditCard, Clock, AlertCircle,
  Activity, Loader2, ShieldCheck, CheckCircle, XCircle, Timer,
  ArrowUpRight, Calendar, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useGetAdminDashboardQuery } from '../../store/api/adminApi';
import { format, parseISO } from 'date-fns';

const StatCard = ({ title, value, sub, icon: Icon, color, bg }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>
    </div>
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
    <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
  </div>
);

const getStatusBadge = (status) => {
  switch (status) {
    case 'active': return 'badge-success';
    case 'trial': return 'badge-info';
    case 'expired': return 'badge-danger';
    case 'suspended': return 'badge-warning';
    default: return 'badge-neutral';
  }
};

const AdminDashboard = () => {
  const { data: adminData, isLoading, error, refetch } = useGetAdminDashboardQuery();
  const stats = adminData?.data;

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#044343]" size={24} />
      <span className="text-sm text-slate-400 font-medium">Loading platform data...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <AlertCircle size={40} className="text-rose-400" />
      <p className="text-slate-500 text-sm">{error.data?.message || 'Failed to connect to Authority API'}</p>
      <button onClick={() => refetch()} className="btn btn-primary btn-md px-6">Retry</button>
    </div>
  );

  const cards = [
    { title: 'Total Libraries', value: stats?.totalLibraries ?? 0, sub: 'All managed nodes', icon: Library, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Active Libraries', value: stats?.activeLibraries ?? 0, sub: 'Currently operational', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Trial Libraries', value: stats?.trialLibraries ?? 0, sub: 'In evaluation period', icon: Timer, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Suspended', value: stats?.suspendedLibraries ?? 0, sub: 'Platform restricted', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`, sub: 'This billing cycle', icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'New Signups', value: stats?.newSignups ?? 0, sub: 'Last 30 days', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Expiring Soon', value: stats?.expiringSoon ?? 0, sub: 'Within 7 days', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Total Libraries', value: stats?.totalLibraries ?? 0, sub: 'Platform lifetime', icon: BarChart2, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const nodeDistribution = [
    { label: 'Active', count: stats?.activeLibraries ?? 0, color: 'bg-emerald-500' },
    { label: 'Trial', count: stats?.trialLibraries ?? 0, color: 'bg-sky-500' },
    { label: 'Expired', count: stats?.expiredLibraries ?? 0, color: 'bg-slate-300' },
    { label: 'Suspended', count: stats?.suspendedLibraries ?? 0, color: 'bg-rose-400' },
  ];
  const total = stats?.totalLibraries || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Global intelligence across all managed library nodes.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[11px] font-semibold text-slate-500 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Platform Operational
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.slice(0, 8).map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Library Growth</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Monthly provisioning over last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.growthData || []}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#044343" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#044343" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="libraries" stroke="#044343" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Node Distribution */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Node Distribution</h3>
          <div className="space-y-5">
            {nodeDistribution.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
                  <span className="text-[11px] font-bold text-slate-800">{item.count}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${(item.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-[#044343]/5 rounded-xl border border-[#044343]/10">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-[#044343]" />
              <span className="text-[10px] font-bold text-[#044343] uppercase tracking-widest">Security Status</span>
            </div>
            <p className="text-[11px] text-[#044343]/70">All tenant databases encrypted. Platform nominal.</p>
          </div>
        </div>
      </div>

      {/* Recent Libraries */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recently Provisioned</h3>
          <button className="text-[11px] font-semibold text-[#044343] hover:underline">View All Libraries →</button>
        </div>
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">Library</th>
              <th>Plan</th>
              <th>Status</th>
              <th className="px-6 text-right">Provisioned</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentLibraries || []).length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-slate-400 text-sm">No libraries provisioned yet.</td>
              </tr>
            ) : (
              (stats?.recentLibraries || []).map((lib) => (
                <tr key={lib._id}>
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#044343]/10 flex items-center justify-center text-[#044343] font-bold text-sm">
                        {lib.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-none">{lib.name}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{lib.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-[11px] font-bold text-[#044343] uppercase tracking-widest">{lib.plan}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(lib.status)}`}>{lib.status}</span>
                  </td>
                  <td className="px-6 text-right text-[11px] font-semibold text-slate-400">
                    {lib.createdAt ? format(parseISO(lib.createdAt), 'dd MMM yyyy') : '—'}
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

export default AdminDashboard;
