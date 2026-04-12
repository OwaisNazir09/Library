import React from 'react';
import api from '../../services/api';
import { 
  Users, 
  Library, 
  BookOpen, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Mon', usage: 400 },
    { name: 'Tue', usage: 300 },
    { name: 'Wed', usage: 600 },
    { name: 'Thu', usage: 800 },
    { name: 'Fri', usage: 500 },
    { name: 'Sat', usage: 900 },
    { name: 'Sun', usage: 1100 },
  ];

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-[#044343]" size={48} /></div>;

  const cards = [
    { title: 'Total Libraries', value: stats?.totalTenants, icon: Library, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Registered Users', value: stats?.totalSystemUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Global Inventory', value: stats?.totalBooks, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Platform Revenue', value: stats?.revenue, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-400 font-medium">Monitoring platform health and ecosystem growth.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
           <Activity className="text-emerald-500" size={20} />
           <span className="text-sm font-black text-slate-900 uppercase tracking-widest">System Status: Optimal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div key={index} className="glass-card p-8 flex flex-col justify-between group hover:translate-y-[-4px] transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                   <card.icon size={28} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                   <ArrowUpRight size={12} />
                   +12%
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h2>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-10 h-[450px]">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-lg font-black text-slate-900">Platform Traffic (All Tenants)</h3>
             <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
             </select>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#044343" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#044343" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748B'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748B'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(4, 67, 67, 0.1)' }}
                cursor={{ stroke: '#044343', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Area type="monotone" dataKey="usage" stroke="#044343" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-10 flex flex-col">
           <h3 className="text-lg font-black text-slate-900 mb-8">Active Subscriptions</h3>
           <div className="space-y-6 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-sm">
                         <img src={`https://i.pravatar.cc/80?u=${i}`} alt="user" />
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-900">Central Library NY</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Plan</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-slate-900">$499.00</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase">Active</p>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-10 py-4 bg-slate-50 text-[#044343] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#044343] hover:text-white transition-all">
              View All Billing
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
