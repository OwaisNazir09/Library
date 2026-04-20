import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Clock, AlertCircle, ShoppingCart,
  ArrowUpRight, Award, CheckCircle2, MoreHorizontal,
  ArrowRight, Coffee, Globe
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from 'recharts';

import { useGetDashboardStatsQuery } from '../../store/api/dashboardApi';
import { useGetFinanceStatsQuery } from '../../store/api/financeApi';
import ErrorState from '../../components/common/ErrorState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AdminDashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useGetDashboardStatsQuery();
  const { data: financeData, isLoading: financeLoading, error: financeError, refetch: refetchFinance } = useGetFinanceStatsQuery();

  const stats = dashboardData?.data;
  const ledgerStats = financeData?.data;
  const loading = dashboardLoading || financeLoading;
  const error = dashboardError || financeError;

  const { categoryData = [], trendData = [], topBorrowedBook = null, topAuthors = [], overdueItems = [], recentActivities = [], revenueData = [] } = stats || {};

  const handleRetry = () => { refetchDashboard(); refetchFinance(); };

  const statCardsData = [
    { label: 'Total Books', value: stats?.totalBooks || '0', sub: 'In collection', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Active Members', value: stats?.totalUsers || '0', sub: 'Total members', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Study Desks', value: stats?.tables?.total || '0', sub: 'Private Desks', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Collected Fees', value: `₹${ledgerStats?.totalIncome || 0}`, sub: 'Total Income', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Dues', value: `₹${ledgerStats?.pendingFees || 0}`, sub: 'Overdue', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Expired Desks', value: stats?.tables?.expired || '0', sub: 'Action Req', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (error) return <div className="p-8"><ErrorState message="Failed to load metrics" onRetry={handleRetry} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Library Dashboard</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Welcome back! Overview of library performance today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCardsData.map((stat, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon size={16} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.sub}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{loading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Most Borrowed Categories */}
        <div className="card lg:col-span-1 p-5 flex flex-col">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Borrowed Categories</h3>
          <div className="flex-1 flex items-center relative min-h-[160px]">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[12px] font-semibold text-slate-600">{cat.name}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Revenue Breakdown</h3>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{ledgerStats?.totalIncome || 0}</p>
            </div>
            <select className="text-[11px] font-bold text-slate-400 bg-transparent border-none focus:ring-0">
              <option>Past 7 days</option>
            </select>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#F8FAFB' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: 'none', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#044343" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Book */}
        <div className="card lg:col-span-1 p-5">
           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Top Book</h3>
           {topBorrowedBook ? (
             <div className="space-y-4">
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-100">
                   <img src={topBorrowedBook.coverImage} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                   <h4 className="text-[14px] font-bold text-slate-900 truncate">{topBorrowedBook.title}</h4>
                   <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">{topBorrowedBook.author}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase">Borrows</p><p className="text-sm font-bold text-[#044343]">{topBorrowedBook.borrowers}</p></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase">Stock</p><p className="text-sm font-bold text-slate-900">{topBorrowedBook.available}</p></div>
                </div>
             </div>
           ) : <p className="text-xs text-slate-400 italic">No data available</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Overdue Table */}
         <div className="card lg:col-span-3 p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Overdue Reminders</h3>
               <button className="btn btn-ghost btn-sm text-[11px] font-bold uppercase">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="table-main">
                  <thead>
                    <tr>
                      <th className="px-5">Member</th>
                      <th>Book</th>
                      <th>Days</th>
                      <th>Fine</th>
                      <th className="px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueItems.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td className="px-5">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{row.name?.charAt(0)}</div>
                             <span className="text-[12px] font-semibold text-slate-900">{row.name}</span>
                          </div>
                        </td>
                        <td className="text-[12px] font-semibold text-slate-600 truncate max-w-[150px]">{row.book}</td>
                        <td className="text-[12px] font-bold text-rose-500">{row.days}d</td>
                        <td className="text-[12px] font-bold text-slate-900">{row.fine}</td>
                        <td className="px-5 text-right"><button className="btn btn-secondary btn-sm h-7 text-[10px] font-bold uppercase">Notify</button></td>
                      </tr>
                    ))}
                    {!overdueItems.length && <tr><td colSpan="5" className="p-10 text-center text-slate-400 text-xs font-medium italic">No overdue items today</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Recent Activity */}
         <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
               <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
            </div>
            <div className="p-5 space-y-5">
               {recentActivities.slice(0, 4).map((activity, i) => (
                 <div key={i} className="flex gap-3 relative">
                   {i !== recentActivities.slice(0, 4).length - 1 && <div className="absolute left-[13px] top-8 bottom-[-20px] w-px bg-slate-100" />}
                   <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activity.color} bg-opacity-10 text-xs`}>
                      <Clock size={14} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-900 leading-tight">{activity.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">{activity.desc}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase">{activity.time}</p>
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
