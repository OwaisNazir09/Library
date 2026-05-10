import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Sparkles, ChevronRight, Headphones,
  ShieldCheck, Globe, Zap, Activity
} from 'lucide-react';

const Support = () => {
  const supportNumbers = [
    {
      number: '7889781170',
      label: 'Primary Support Line',
      desc: 'Direct line for technical troubleshooting and system support.',
      availability: '24/7 Priority'
    },
    {
      number: '7006968285',
      label: 'Billing & Account Help',
      desc: 'Contact for subscription queries, invoices, and payments.',
      availability: 'Mon - Sat (9AM - 6PM)'
    }
  ];

  const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Solid Administrative Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-widest">Connect with our support representatives</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Support Live & Active
        </div>
      </div>

      {/* Solid Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportNumbers.map((item, idx) => (
          <div key={idx} className="card p-0 overflow-hidden border-slate-200 shadow-sm bg-white">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-0.5">{item.availability}</p>
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{item.number}</h3>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                {item.desc}
              </p>
              <a
                href={`tel:${item.number}`}
                className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-md shadow-teal-900/10"
              >
                Connect Now <ChevronRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Support;
