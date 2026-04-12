import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Repeat, DollarSign, TrendingUp, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReportsSummary, getMonthlyAnalytics } from '../../services/reportService';

const mockChartData = [
  { name: 'Jan', books: 120 },
  { name: 'Feb', books: 156 },
  { name: 'Mar', books: 210 },
  { name: 'Apr', books: 180 },
  { name: 'May', books: 280 },
  { name: 'Jun', books: 320 },
];

const mockPopularBooks = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', issues: 145 },
  { id: 2, title: '1984', author: 'George Orwell', issues: 120 },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', issues: 95 },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', issues: 85 },
];

const Reports = () => {
  const [stats, setStats] = useState({
    totalBooks: 4208,
    issuedBooks: 840,
    activeStudents: 1204,
    revenue: 8450
  });
  
  const [chartData, setChartData] = useState(mockChartData);
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
          setChartData(analyticalRes.data);
        }
      } catch (err) {
        console.warn("API not available or failed. Falling back to mock data.", err);
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
          { label: 'Total Revenue', value: `$${stats.revenue || 0}`, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
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
                    <stop offset="5%" stopColor="#044343" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#044343" stopOpacity={0}/>
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

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900">Popular Books</h2>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
              <BarChart2 size={18} />
            </div>
          </div>
          <div className="space-y-6">
            {mockPopularBooks.map((book, i) => (
              <div key={book.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{book.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#044343]">{book.issues}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Issues</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
