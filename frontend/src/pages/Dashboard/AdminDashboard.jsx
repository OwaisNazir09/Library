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
  LineChart, Line, AreaChart, Area
} from 'recharts';


import { useGetDashboardStatsQuery } from '../../store/api/dashboardApi';
import { useGetFinanceStatsQuery } from '../../store/api/financeApi';
import ErrorState from '../../components/common/ErrorState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AdminDashboard = () => {
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useGetDashboardStatsQuery();

  const { 
    data: financeData, 
    isLoading: financeLoading, 
    error: financeError,
    refetch: refetchFinance
  } = useGetFinanceStatsQuery();

  const stats = dashboardData?.data;
  const ledgerStats = financeData?.data;
  const loading = dashboardLoading || financeLoading;
  const error = dashboardError || financeError;

  const { 
    categoryData = [], 
    trendData = [], 
    topBorrowedBook = null, 
    topAuthors = [], 
    overdueItems = [], 
    recentActivities = [], 
    revenueData = [] 
  } = stats || {};

  const handleRetry = () => {
    refetchDashboard();
    refetchFinance();
  };

  const statCardsData = [
    { label: 'Total Books', value: stats?.totalBooks || '0', change: '+120', sub: 'In collection', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Active Members', value: stats?.totalUsers || '0', change: '+3.7%', sub: 'Total members', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Study Desks', value: stats?.tables?.total || '0', change: `${stats?.tables?.available || 0} Avail`, sub: 'Private Desks', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Collected Fees', value: `₹${ledgerStats?.totalIncome || 0}`, change: `+₹...`, sub: 'Total Income', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Dues', value: `₹${ledgerStats?.pendingFees || 0}`, change: `Receivables`, sub: 'Overdue', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Expired Desks', value: stats?.tables?.expired || '0', change: 'Action Req', sub: 'Pending unassign', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error?.data?.message || 'Failed to load dashboard metrics'} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Library Dashboard</h1>
        <p className="text-slate-500 font-medium">Welcome back! Here's what's happening in your library today.</p>
      </div>
      {/* Top Section: Stats & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {statCardsData.map((stat, i) => (
            <div key={i} className="glass-card p-6 flex flex-col justify-between group hover:border-[#044343]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                  <stat.icon size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{stat.sub}</span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? '...' : stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Most Borrowed Categories */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900">Most Borrowed Categories</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>This week</option>
            </select>
          </div>
          <div className="flex-1 flex items-center relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#044343] mb-1" />
              <p className="text-xs font-bold text-slate-900">{categoryData[0]?.name || 'No Data'}</p>
              <p className="text-[10px] text-slate-400 font-bold">{categoryData[0]?.value || 0}% - {categoryData[0]?.count || 0} Books</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                  <span className="text-xs font-bold text-slate-400">{cat.value}%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{cat.count} Borrows</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Borrowed Books */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Top Borrowed Books</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>This week</option>
            </select>
          </div>
          {topBorrowedBook ? (
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center group cursor-pointer relative">
              <div className="w-full h-48 rounded-xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                <img src={topBorrowedBook?.coverImage || "https://images.unsplash.com/photo-1543004471-24b622242139?q=80&w=400"} alt={topBorrowedBook?.title} className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-white border border-slate-100 rounded-md">{topBorrowedBook?.category || 'Fiction'}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{topBorrowedBook?.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{topBorrowedBook?.author}</p>
              </div>
              <div className="mt-4 flex gap-6 border-t border-slate-200 pt-4 w-full justify-center">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Borrowers</p>
                  <p className="text-xs font-black text-[#044343]">{topBorrowedBook?.borrowers || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Available</p>
                  <p className="text-xs font-black text-rose-500">{topBorrowedBook?.available || 0} Copies</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">No Top Books yet...</div>
          )}
        </div>
      </div>

      {/* Middle Section: Revenue & Check-ins & Authors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 glass-card p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Breakdown</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Total <span className="text-xl font-black text-slate-900 ml-2">₹{ledgerStats?.totalIncome || 0}</span></p>
            </div>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>This week</option>
            </select>
          </div>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 2 ? '#044343' : '#A7F3D0'}
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Library Check-Ins vs Borrowing Trend */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-tight">Library Check-Ins vs <br /> Borrowing Trend</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>Monthly</option>
            </select>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#044343]" />
              <span className="text-[10px] font-bold text-slate-400">Check-Ins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[10px] font-bold text-slate-400">Borrowed</span>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Line type="monotone" dataKey="checkins" stroke="#044343" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="borrowed" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Authors */}
        <div className="glass-card p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Authors</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>This week</option>
            </select>
          </div>
          <div className="space-y-6">
            {topAuthors.map((author, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex-shrink-0">
                  <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt={author.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">{author.name}</h4>
                  <div className="flex items-center gap-3 mt-1 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <span className="text-[10px] flex items-center gap-1 font-bold">
                      <BookOpen size={10} /> {author.books} Books
                    </span>
                    <span className="text-[10px] flex items-center gap-1 font-bold">
                      <Users size={10} /> {author.borrowers} Borrowers
                    </span>
                  </div>
                </div>
                <span className="text-xl">{author.award}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Overdue Table & Stock Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">
        {/* Overdue Items Summary */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Overdue Items Summary</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>This week</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <tr>
                  <th className="pb-4">Borrower :</th>
                  <th className="pb-4">Book Info :</th>
                  <th className="pb-4">Days O/D :</th>
                  <th className="pb-4">Fine :</th>
                  <th className="pb-4 text-right">Action :</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {overdueItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs font-bold">No overdue items.</td>
                  </tr>
                ) : overdueItems.map((row, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3 text-slate-900">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" >
                          {row.profilePicture ? (
                            <img src={row.profilePicture} alt="user" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                               {row.name?.charAt(0) || <Users size={14} />}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{row.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">ID: {row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-8 bg-slate-200 rounded flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">{row.book}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[100px]">{row.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-900">{row.days}</td>
                    <td className="py-4 text-xs font-black text-[#044343]">{row.fine}</td>
                    <td className="py-4 text-right">
                      <button className="px-5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-[#044343] hover:bg-slate-50 transition-all">Notify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="glass-card p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Stock Overview</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>Monthly</option>
            </select>
          </div>
          <div className="relative h-40 w-40 flex items-center justify-center">
            <div className="absolute inset-0 border-[12px] border-slate-100 rounded-full border-b-transparent rotate-[135deg]" />
            <div className="absolute inset-0 border-[12px] border-[#044343] rounded-full border-l-transparent border-b-transparent border-t-transparent rotate-[45deg]" />
            <div className="text-center">
              <p className="text-xl font-black text-slate-900">{stats?.totalBooks || '0'}</p>
              <p className="text-[10px] text-slate-400 font-bold">Total Books</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-y-4 gap-x-6 mt-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Available Books</p>
              <p className="text-xs font-bold text-slate-900">{(stats?.totalBooks - stats?.activeBorrowings) || '0'} copies</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Issued Books</p>
              <p className="text-xs font-bold text-slate-900">{stats?.activeBorrowings || '0'} copies</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Reserved / Held</p>
              <p className="text-xs font-bold text-slate-900">0 copies</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Damaged</p>
              <p className="text-xs font-bold text-rose-500">0 copies</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
            <select className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none">
              <option>This week</option>
            </select>
          </div>
          <div className="space-y-6">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">No recent activities.</div>
            ) : recentActivities.map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 tracking-tight">{activity.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">{activity.desc}</p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] font-black text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><Clock size={10} /> {activity.time}</span>
                    <span>{activity.date}</span>
                  </div>
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
