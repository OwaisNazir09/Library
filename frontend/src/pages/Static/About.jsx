import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Users, Shield, Globe, Zap } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-teal-100">
      {/* Simple Header */}
      <nav className="border-b border-slate-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Blinkbit Labs</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-[42px] font-black text-slate-900 tracking-tighter leading-tight uppercase italic mb-6">
            Empowering Knowledge <br />Through Technology
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Welib by Blinkbit Labs is the next-generation library operating system designed to digitize, automate, and scale educational institutions worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#044343]">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed">
              To provide libraries of all sizes with professional-grade tools that were previously only available to elite universities. We believe every student deserves a seamless reading experience.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Built for Scale</h3>
            <p className="text-slate-600 leading-relaxed">
              Our multi-tenant architecture allows us to serve thousands of libraries simultaneously, ensuring 99.9% uptime and zero data leakage between institutions.
            </p>
          </div>
        </div>

        <section className="bg-slate-50 rounded-[32px] p-12 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">The Blinkbit Promise</h2>
          <div className="space-y-6">
            {[
              { icon: Shield, title: 'Uncompromising Security', desc: 'Your data is encrypted at rest and in transit using industry-standard protocols.' },
              { icon: Globe, title: 'Always Available', desc: 'Our infrastructure is distributed across multiple regions to ensure global accessibility.' },
              { icon: Zap, title: 'Speed First', desc: 'We optimize every millisecond of the user experience to keep your library moving.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="mt-1"><item.icon size={20} className="text-[#044343]" /></div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">© 2026 Blinkbit Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
