import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Activity, Clock, Server } from 'lucide-react';

const Status = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-teal-100">
      <nav className="border-b border-slate-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">All Systems Operational</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h1 className="text-[36px] font-black text-slate-900 tracking-tighter uppercase italic mb-2">Platform Status</h1>
          <p className="text-slate-500 font-medium">Real-time health of Welib Cloud Engine.</p>
        </div>

        <div className="space-y-6">
          {[
            { name: 'Multi-Tenant API', status: 'Operational', uptime: '99.99%' },
            { name: 'Core Database Cluster', status: 'Operational', uptime: '100%' },
            { name: 'Cloudinary Asset Sync', status: 'Operational', uptime: '99.95%' },
            { name: 'Admin Dashboard', status: 'Operational', uptime: '99.99%' },
            { name: 'Mobile App Gateway', status: 'Operational', uptime: '99.98%' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-slate-900">{item.uptime}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">30 Day Uptime</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6">
          <div className="p-6 text-center border border-slate-100 rounded-2xl">
            <Activity className="mx-auto text-blue-600 mb-2" size={20} />
            <p className="text-[20px] font-bold text-slate-900">14ms</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latency</p>
          </div>
          <div className="p-6 text-center border border-slate-100 rounded-2xl">
            <Clock className="mx-auto text-orange-600 mb-2" size={20} />
            <p className="text-[20px] font-bold text-slate-900">99.9%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime SLA</p>
          </div>
          <div className="p-6 text-center border border-slate-100 rounded-2xl">
            <Server className="mx-auto text-indigo-600 mb-2" size={20} />
            <p className="text-[20px] font-bold text-slate-900">4 Regions</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Nodes</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Status;
