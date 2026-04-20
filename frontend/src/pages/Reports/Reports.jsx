import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Repeat, IndianRupeeIcon, TrendingUp, BarChart2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReportsSummary, getMonthlyAnalytics } from '../../services/reportService';

const Reports = () => {
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-500 font-medium">Overview of your library's performance and usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Books', value: stats.totalBooks || 0, icon: Book, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Issued Books', value: stats.issuedBooks || 0, icon: Repeat, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Students', value: stats.activeStudents || 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Total Revenue', value: `$${stats.revenue || 0}`, icon: IndianRupeeIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900">Monthly Issued Books</h2>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#044343" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#044343" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#044343', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="books" stroke="#044343" strokeWidth={3} fillOpacity={1} fill="url(#colorBooks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900">Popular Books</h2>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
              <BarChart2 size={18} />
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            {popularBooks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularBooks} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#475569', fontWeight: 700 }} width={120} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#044343" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">No books borrowed yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
