import React from 'react';
import { useGetPlatformAnalyticsQuery } from '../../store/api/adminApi';
import {
  Library, Users, BookOpen, TrendingUp, Loader2, Activity,
  DollarSign, PieChart as PieIcon, BarChart3, Calendar, ShieldCheck,
  ArrowUpRight, ExternalLink
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#044343', '#0E7490', '#6366F1', '#A855F7', '#EC4899'];

const Analytics = () => {
  const { data: analyticsData, isLoading } = useGetPlatformAnalyticsQuery();
  const stats = analyticsData?.data;

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="animate-spin text-teal-600" size={32} />
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Intelligence...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
        <p className="text-sm font-medium text-slate-500 mt-0.5">Global performance monitoring and financial intelligence.</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month (Bar Chart) */}
        <div className="card p-8 bg-white border-transparent shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revenue by Month</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Platform revenue trajectory</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <DollarSign size={18} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.revenueByMonth || [{ month: 'Jan', revenue: 4000 }, { month: 'Feb', revenue: 5500 }, { month: 'Mar', revenue: 6200 }, { month: 'Apr', revenue: 8000 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New Libraries Growth (Area Chart) */}
        <div className="card p-8 bg-white border-transparent shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Growth Forecast</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">New node provisioning trend</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats?.newLibrariesGrowth || []}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#044343" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#044343" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="libraries" stroke="#044343" strokeWidth={3} fill="url(#growthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Usage (Pie Chart) */}
        <div className="card p-8 bg-white border-transparent shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Plan Distribution</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Subscription tier breakdown</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <PieIcon size={18} />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats?.planUsage || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {stats?.planUsage?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {stats?.planUsage?.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{p.name}</span>
                  <span className="text-[11px] font-black text-slate-900 ml-auto">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expiry Forecast (Bar Chart) */}
        <div className="card p-8 bg-white border-transparent shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Expiry Forecast</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Upcoming node subscription renewals</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <Calendar size={18} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.expiryForecast || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 900 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="expiries" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Paying Libraries Table */}
      <div className="card p-0 overflow-hidden bg-white border-transparent shadow-sm">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Yielding Nodes</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">Highest platform revenue contributors</p>
          </div>
          <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
            <ExternalLink size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-main">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4">Library Entity</th>
                <th>Plan Tier</th>
                <th>Monthly Yield</th>
                <th className="px-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.topPayingLibraries || []).length === 0 ? (
                <tr><td colSpan="4" className="text-center py-20 text-xs font-black text-slate-300 uppercase">Insufficient node data</td></tr>
              ) : (
                stats.topPayingLibraries.map((lib, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#044343] text-white flex items-center justify-center font-black text-sm">
                          {lib.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{lib.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">ID: {lib._id?.substring(18).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{lib.plan}</span>
                    </td>
                    <td>
                      <span className="text-[13px] font-black text-slate-900">₹{lib.plan === 'enterprise' ? '25,000' : '5,000'}</span>
                    </td>
                    <td className="px-8 text-right">
                      <span className="badge badge-success font-black text-[9px] uppercase tracking-widest">Operational</span>
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

export default Analytics;
