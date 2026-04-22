import React from 'react';
import {
  Library, TrendingUp, Users, CreditCard, Clock, AlertCircle,
  Activity, Loader2, ShieldCheck, CheckCircle, XCircle, Timer,
  ArrowUpRight, Calendar, BarChart2, PieChart as PieIcon, DollarSign,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useGetAdminDashboardQuery } from '../../store/api/adminApi';
import { format, parseISO } from 'date-fns';

const StatCard = ({ title, value, sub, icon: Icon, color, bg }) => (
  <div className="card p-6 bg-white border-transparent shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon size={22} className={color} />
      </div>
      <div className="p-1 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-600" />
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
    <p className="text-[11px] font-bold text-slate-400 mt-1">{sub}</p>
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
      <Loader2 className="animate-spin text-teal-600" size={32} />
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Waking Up Admin Authority...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertCircle size={32} className="text-rose-500" />
      </div>
      <p className="text-slate-900 font-bold">{error.data?.message || 'Failed to connect to Authority API'}</p>
      <button onClick={() => refetch()} className="btn btn-primary btn-md px-10">Retry Connection</button>
    </div>
  );

  const cards = [
    { title: 'Total Libraries', value: stats?.totalLibraries ?? 0, sub: 'Global footprint', icon: Library, color: 'text-slate-900', bg: 'bg-slate-100' },
    { title: 'Active Libraries', value: stats?.activeLibraries ?? 0, sub: 'Currently Operational', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Trial Libraries', value: stats?.trialLibraries ?? 0, sub: 'Awaiting Conversion', icon: Timer, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Expired Libraries', value: stats?.expiredLibraries ?? 0, sub: 'Requires Attention', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`, sub: 'Estimated for April', icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, sub: 'Lifetime platform yield', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Payments', value: stats?.pendingPayments || 0, sub: 'Awaiting Settlement', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'New Libraries', value: stats?.newSignups ?? 0, sub: 'Last 30 days growth', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  const planColors = ['#044343', '#0E7490', '#6366F1', '#A855F7'];
  const planData = [
    { name: 'Trial', value: stats?.trialLibraries || 0 },
    { name: 'Starter', value: 10 }, // Placeholders for now
    { name: 'Pro', value: 5 },
    { name: 'Enterprise', value: 2 },
  ];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Authority</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Real-time intelligence across the SaaS ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM NOMINAL
          </div>
          <button onClick={() => refetch()} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 card p-8 bg-white border-transparent shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revenue Growth</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Platform monthly revenue yield</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} /> +12%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats?.growthData || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}
              />
              <Area type="monotone" dataKey="libraries" stroke="#6366F1" strokeWidth={3} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="card p-8 bg-white border-transparent shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Plan Distribution</h3>
          <p className="text-[11px] font-bold text-slate-400 mb-8">Node distribution by service tier</p>
          <div className="flex-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={planData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={planColors[index % planColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {planData.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: planColors[i] }} />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{p.name}</p>
                    <p className="text-xs font-black text-slate-900">{p.value} Nodes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Libraries Chart */}
        <div className="lg:col-span-1 card p-8 bg-white border-transparent shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Onboarding Trend</h3>
          <p className="text-[11px] font-bold text-slate-400 mb-8">New nodes provisioned per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.growthData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="libraries" fill="#044343" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Libraries */}
        <div className="lg:col-span-2 card p-0 overflow-hidden bg-white border-transparent shadow-sm">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Provisions</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Latest infrastructure nodes activated</p>
            </div>
            <button className="text-[11px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700">View Infrastructure Node List</button>
          </div>
          <div className="overflow-x-auto">
            <table className="table-main">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4">Library</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th className="px-8 text-right">Provisioned</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentLibraries || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-20 opacity-30">
                      <Library size={48} className="mx-auto mb-4 text-slate-400" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No nodes provisioned yet</p>
                    </td>
                  </tr>
                ) : (
                  (stats?.recentLibraries || []).map((lib) => (
                    <tr key={lib._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                            {lib.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">{lib.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{lib.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-[11px] font-black text-[#044343] uppercase tracking-widest">{lib.plan}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(lib.status)} font-black text-[9px] uppercase tracking-widest`}>{lib.status}</span>
                      </td>
                      <td className="px-8 text-right text-[11px] font-bold text-slate-400 uppercase">
                        {lib.createdAt ? format(parseISO(lib.createdAt), 'dd MMM yyyy') : '—'}
                      </td>
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
