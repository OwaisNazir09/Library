import React from 'react';
import { useGetTenantsQuery } from '../../store/api/adminApi';
import {
  Library, Users, BookOpen, TrendingUp, Loader2, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#044343', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const Analytics = () => {
  const { data, isLoading } = useGetTenantsQuery({});
  const tenants = data?.data || [];

  const now = new Date();
  const growthData = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const count = tenants.filter(t => {
      const d = new Date(t.createdAt);
      return d >= month && d <= monthEnd;
    }).length;
    const cumulative = tenants.filter(t => new Date(t.createdAt) <= monthEnd).length;
    growthData.push({
      name: month.toLocaleString('default', { month: 'short' }),
      new: count,
      total: cumulative
    });
  }

  const planDist = [
    { name: 'Trial', value: tenants.filter(t => t.plan === 'trial').length },
    { name: 'Starter', value: tenants.filter(t => t.plan === 'starter').length },
    { name: 'Professional', value: tenants.filter(t => t.plan === 'professional').length },
    { name: 'Enterprise', value: tenants.filter(t => t.plan === 'enterprise').length },
  ].filter(d => d.value > 0);

  const statusDist = [
    { name: 'Active', value: tenants.filter(t => t.status === 'active').length },
    { name: 'Trial', value: tenants.filter(t => t.status === 'trial').length },
    { name: 'Expired', value: tenants.filter(t => t.status === 'expired').length },
    { name: 'Suspended', value: tenants.filter(t => t.status === 'suspended').length },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Libraries', value: tenants.length, icon: Library, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Libraries', value: tenants.filter(t => t.status === 'active').length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Trial Libraries', value: tenants.filter(t => t.status === 'trial').length, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Total Users', value: '—', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#044343]" size={24} />
      <span className="text-sm text-slate-400 font-medium">Loading analytics...</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Platform Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Real-time usage data and growth metrics across all library nodes.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="card p-5">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
              <c.icon size={16} className={c.color} />
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Library Growth */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Library Growth</h3>
          <p className="text-[11px] text-slate-400 mb-6">New vs cumulative library nodes over 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="new" name="New" fill="#044343" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Cumulative" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Trend */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Cumulative Growth</h3>
          <p className="text-[11px] text-slate-400 mb-6">Total library ecosystem expansion</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#044343" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#044343" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#044343" strokeWidth={2} fill="url(#cumGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Plan Distribution</h3>
          <p className="text-[11px] text-slate-400 mb-6">Breakdown of subscription plans across library nodes</p>
          {planDist.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">No plan data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-[11px] font-semibold text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Status Distribution</h3>
          <p className="text-[11px] text-slate-400 mb-6">Platform node health overview</p>
          {statusDist.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">No status data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-[11px] font-semibold text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
