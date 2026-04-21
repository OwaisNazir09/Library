import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Clock, AlertCircle, ShoppingCart,
  ArrowUpRight, Award, CheckCircle2, MoreHorizontal,
  ArrowRight, Coffee, Globe, TrendingUp, Wallet
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
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

  const { categoryData = [], revenueData = [], topBorrowedBook = null, overdueItems = [], recentActivities = [] } = stats || {};

  const handleRetry = () => { refetchDashboard(); refetchFinance(); };

  const statCardsData = [
    { label: 'Total Books', value: stats?.totalBooks || '0', sub: 'Collection Size', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Active Members', value: stats?.totalUsers || '0', sub: 'Library Users', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Study Desks', value: stats?.tables?.total || '0', sub: 'Capacity', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Net Income', value: `₹${(ledgerStats?.totalIncome || 0).toLocaleString()}`, sub: 'All Time', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Dues', value: `₹${(ledgerStats?.pendingFees || 0).toLocaleString()}`, sub: 'Unpaid', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Table Expiry', value: stats?.tables?.expired || '0', sub: 'Attention', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (error) return <div className="p-8"><ErrorState message="Failed to load library metrics" onRetry={handleRetry} /></div>;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Pulse</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Real-time performance and occupancy overview.</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleRetry} className="btn btn-secondary btn-sm h-9 px-4 rounded-xl">Refresh Data</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCardsData.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.sub}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-2">{loading ? '...' : stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Most Borrowed Categories */}
        <div className="card lg:col-span-1 p-6 flex flex-col">
          <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest mb-6">Inventory Mix</h3>
          <div className="flex-1 flex items-center relative min-h-[180px]">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                  <span className="text-[13px] font-bold text-slate-600">{cat.name}</span>
                </div>
                <span className="text-[12px] font-bold text-slate-400">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card lg:col-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Revenue Velocity</h3>
              <p className="text-2xl font-bold text-slate-900 mt-2">₹{(ledgerStats?.totalIncome || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-500 border border-slate-100">
               <TrendingUp size={14} className="text-emerald-500" />
               +22% this week
            </div>
          </div>
          <div className="h-[220px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#F8FAFB' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#044343" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Book */}
        <div className="card lg:col-span-1 p-6 flex flex-col">
           <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest mb-6">Staff Pick</h3>
           {topBorrowedBook ? (
             <div className="flex-1 flex flex-col justify-between">
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group">
                   <img src={topBorrowedBook.coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                   <h4 className="text-[15px] font-bold text-slate-900 truncate leading-tight">{topBorrowedBook.title}</h4>
                   <p className="text-[12px] text-slate-400 font-bold mt-1.5 truncate">{topBorrowedBook.author}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borrows</p><p className="text-sm font-bold text-teal-600">{topBorrowedBook.borrowers}</p></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</p><p className="text-sm font-bold text-slate-900">{topBorrowedBook.available}</p></div>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen size={24} className="text-slate-300 mb-2" />
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No data available</p>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Overdue Table */}
         <div className="card lg:col-span-3 p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
               <div>
                  <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Overdue Alerts</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">Pending book returns and desk expiries.</p>
               </div>
               <button className="btn btn-ghost btn-sm h-8 px-3 rounded-lg text-[11px] font-bold uppercase">View Ledger</button>
            </div>
            <div className="overflow-x-auto">
               <table className="table-main">
                  <thead>
                    <tr>
                      <th className="px-6 py-3">Member</th>
                      <th>Reference</th>
                      <th>Overdue</th>
                      <th>Current Fine</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueItems.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td className="px-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[12px] font-bold text-slate-500 border border-slate-200">
                                {row.name?.charAt(0)}
                             </div>
                             <span className="text-[13px] font-bold text-slate-900">{row.name}</span>
                          </div>
                        </td>
                        <td className="text-[13px] font-bold text-slate-600 truncate max-w-[150px]">{row.book}</td>
                        <td><span className="badge badge-danger lowercase">{row.days} days late</span></td>
                        <td className="text-[14px] font-bold text-slate-900">₹{row.fine}</td>
                        <td className="px-6 text-right">
                           <button className="btn btn-primary btn-sm h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest">Notify</button>
                        </td>
                      </tr>
                    ))}
                    {!overdueItems.length && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-500">
                              <CheckCircle2 size={24} />
                           </div>
                           <p className="text-slate-900 font-bold text-sm">Clear Horizons</p>
                           <p className="text-slate-400 text-xs mt-1 font-medium">No overdue items detected today.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Recent Activity */}
         <div className="card p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50">
               <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Audit Trail</h3>
               <p className="text-[11px] text-slate-400 font-medium mt-1">Latest library events.</p>
            </div>
            <div className="p-6 space-y-6 flex-1">
               {recentActivities.slice(0, 4).map((activity, i) => (
                 <div key={i} className="flex gap-4 relative">
                   {i !== recentActivities.slice(0, 4).length - 1 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-slate-100" />}
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${activity.color} bg-opacity-10 border border-slate-100 shadow-sm transition-transform hover:scale-110`}>
                      <Clock size={16} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 leading-none">{activity.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-2 truncate">{activity.desc}</p>
                      <p className="text-[9px] text-slate-300 font-bold mt-2 uppercase tracking-tighter">{activity.time}</p>
                   </div>
                 </div>
               ))}
               {!recentActivities.length && (
                 <p className="text-xs text-slate-400 italic text-center py-10 font-medium">Waiting for activity...</p>
               )}
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
               <button className="w-full btn btn-secondary btn-sm h-10 rounded-xl text-[11px] font-bold uppercase tracking-widest">Global Activity</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
