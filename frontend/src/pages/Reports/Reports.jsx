import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Repeat, IndianRupeeIcon, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReportsSummary, getMonthlyAnalytics } from '../../services/reportService';

const Reports = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    issuedBooks: 0,
    activeStudents: 0,
    revenue: 0
  });

  const [chartData, setChartData] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await getReportsSummary();
        const analyticalRes = await getMonthlyAnalytics();

        if (summaryRes?.data) {
          setStats(summaryRes.data);
          setIsLive(true);
        }
        if (analyticalRes?.data) {
          setChartData(analyticalRes.data.trend || []);
          setPopularBooks(analyticalRes.data.popularBooks || []);
        }
      } catch (err) {
        console.warn("Analytics API failed.", err);
        setIsLive(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Overview of your library's performance and usage metrics</p>
        </div>
        <button 
          onClick={() => navigate('expiring-memberships')}
          className="btn btn-primary flex items-center gap-2 text-xs h-9"
        >
          <AlertTriangle size={14} />
          Expiring Memberships
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Books', value: stats.totalBooks || 0, icon: Book, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Issued Books', value: stats.issuedBooks || 0, icon: Repeat, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Students', value: stats.activeStudents || 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Total Revenue', value: `₹${stats.revenue || 0}`, icon: IndianRupeeIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="card flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900 mt-1 leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-900">Monthly Circulation Trend</h2>
            <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#044343" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#044343" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                  itemStyle={{ color: '#044343', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="books" stroke="#044343" strokeWidth={2} fillOpacity={1} fill="url(#colorBooks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-900">Top Performers</h2>
            <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
              <BarChart2 size={14} />
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            {popularBooks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularBooks} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} width={100} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                  <Bar dataKey="value" fill="#044343" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <Book size={32} className="opacity-20" />
                <p className="text-[11px] font-bold uppercase tracking-widest">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
