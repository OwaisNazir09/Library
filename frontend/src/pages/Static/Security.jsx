import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Key, Lock, Terminal, ShieldAlert } from 'lucide-react';

const Security = () => {
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
          <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest text-[#044343]">Security Center</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={12} /> SOC2 Compliant Infrastructure
          </div>
          <h1 className="text-[42px] font-black text-slate-900 tracking-tighter uppercase italic leading-none">Security Architecture</h1>
          <p className="text-slate-500 mt-6 text-lg max-w-2xl mx-auto font-medium">How Blinkbit Labs protects your library's most sensitive data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            { icon: Lock, title: 'Encryption at Rest', desc: 'All database records are encrypted using AES-256 standards, ensuring that even in the event of hardware theft, your data remains unreadable.' },
            { icon: Key, title: 'Identity Management', desc: 'Secure authentication protocols including salted password hashing and optional multi-factor authentication (MFA).' },
            { icon: Terminal, title: 'Audited Access', desc: 'All administrative actions within the platform are logged and audited to prevent unauthorized changes.' },
            { icon: ShieldAlert, title: 'Threat Monitoring', desc: 'Real-time monitoring for SQL injection, XSS, and DDoS attacks via our Cloud Armor integration.' }
          ].map((item, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-[24px] border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#044343] mb-6">
                <item.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="border-t border-slate-100 pt-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Vulnerability Disclosure</h2>
            <p className="text-slate-600 mb-6">Found a security bug? We take security seriously. Please report any findings to our security team for responsible disclosure and potential reward.</p>
            <button className="px-6 py-3 bg-[#044343] text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors">
              Report a Vulnerability
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Security;
