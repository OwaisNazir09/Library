import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, FileText, Database } from 'lucide-react';

const Privacy = () => {
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
          <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Privacy Policy</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h1 className="text-[36px] font-black text-slate-900 tracking-tighter uppercase italic mb-4">Privacy & Data Protection</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Last Updated: May 10, 2026</p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-50 rounded-lg text-[#044343]"><Lock size={20} /></div>
              <h2 className="text-xl font-bold text-slate-900">Information We Collect</h2>
            </div>
            <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
              <p>We collect information necessary to provide our multi-tenant library management services, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Library administrative contact information.</li>
                <li>Member records as provided by your institution.</li>
                <li>Usage logs to improve platform performance and security.</li>
                <li>Financial transaction metadata for billing purposes.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Database size={20} /></div>
              <h2 className="text-xl font-bold text-slate-900">Data Isolation</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Blinkbit Labs employs strict multi-tenant isolation. Your library's data is stored in isolated database environments, ensuring that no other institution can access your student or collection records.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><Eye size={20} /></div>
              <h2 className="text-xl font-bold text-slate-900">How We Use Your Data</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Your data is used solely for operating the Welib platform. We never sell your library's information or student data to third-party advertisers. All data processing is done to facilitate library operations.
            </p>
          </section>

          <section className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">GDPR & Compliance</h3>
            <p className="text-sm text-slate-600">
              We are committed to international data protection standards. If you have questions about your data rights or wish to request data deletion, please contact our privacy officer at privacy@blinkbitlabs.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
