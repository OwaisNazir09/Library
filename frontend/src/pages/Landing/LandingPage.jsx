import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, RotateCcw, Package, IndianRupee, BarChart2,
  Check, ArrowRight, Star, Twitter, Linkedin, Github, Menu, X,
  ChevronRight, Zap, Shield, Globe, Library, Download, Layout,
  Coffee, CreditCard, HeadphonesIcon, HelpCircle
} from 'lucide-react';
import { useGetPublicStatsQuery, useGetPublicPlansQuery } from '../../store/api/baseApi';

const Navbar = ({ navigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Customers', href: '#testimonials' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/appicon.png" alt="Welib" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Welib</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.name} href={l.href} className="text-[13px] font-semibold text-slate-500 hover:text-[#044343] transition-colors">{l.name}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-[13px] font-bold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">Sign In</button>
          <button onClick={() => navigate('/query')} className="btn btn-primary h-[34px] px-5 rounded-lg text-[12px] font-bold shadow-sm">Get Started</button>
        </div>

        <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden bg-white border-t border-slate-100 px-6 py-6 space-y-4 shadow-xl">
            {links.map(l => (
              <a key={l.name} href={l.href} className="block text-sm font-bold text-slate-600" onClick={() => setMenuOpen(false)}>{l.name}</a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <button onClick={() => navigate('/login')} className="btn btn-secondary w-full py-3">Sign In</button>
              <button onClick={() => navigate('/query')} className="btn btn-primary w-full py-3">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// --- Hero & Dashboard Preview ---
const Hero = ({ navigate, stats }) => {
  const fmt = (n) => n?.toLocaleString('en-IN') || '0';

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center lg:text-left grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-[34px] lg:text-[48px] font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight">
            Welib Modern Library Management<br />
            <span className="text-[#044343]">Built for Growing Institutions</span>
          </h1>
          <p className="text-[16px] text-slate-500 font-medium leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
            Manage students, memberships, study desks, books, and finances — all in one simple, cloud-based platform.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
            <button onClick={() => navigate('/query')} className="btn btn-primary px-8 py-4 rounded-xl text-[14px] font-bold shadow-lg shadow-teal-900/10">Get Started Free</button>
            <button onClick={() => navigate('/login')} className="btn btn-secondary px-8 py-4 rounded-xl text-[14px] font-bold border-slate-200">View Demo</button>
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-6 text-[12px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> No credit card required</div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> 14-day free trial</div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Indian SaaS Compliance</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative hidden lg:block">
          <div className="card p-0 shadow-2xl border-slate-100 overflow-hidden scale-105 origin-center bg-white">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /></div>
              <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-1 text-[10px] text-slate-400 font-bold">app.welib.com/dashboard</div>
            </div>
            <div className="p-6 bg-white space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Books</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{fmt(stats?.totalBooks ?? 0)}</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Students</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{fmt(stats?.totalMembers ?? 0)}</p>
                </div>
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Revenue</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">₹{fmt(stats?.revenue ?? 0)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Activity</p>
                {[
                  { t: 'Live Sync Enabled', s: 'Master DB Cluster', status: 'active' },
                  { t: '256-bit Encryption', s: 'Cloud Armor Active', status: 'secure' },
                  { t: 'Multi-Tenant Isolation', s: 'VPC Tunneling', status: 'active' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0"><p className="text-[12px] font-bold text-slate-800 truncate">{item.t}</p><p className="text-[10px] text-slate-400 font-medium">{item.s}</p></div>
                    <span className={`badge ${item.status === 'secure' ? 'badge-success' : 'badge-neutral'} lowercase`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 card p-4 flex items-center gap-3 shadow-xl border-slate-100 animate-bounce-slow bg-white">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><BarChart2 size={20} /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Growth</p><p className="text-lg font-bold text-slate-900">+23% Up</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Stats Strip ---
const Stats = ({ stats }) => (
  <section className="bg-white border-y border-slate-50 py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { val: stats?.totalLibraries ?? 0, label: 'Libraries' },
        { val: stats?.totalBooks ?? 0, label: 'Books Managed' },
        { val: stats?.totalMembers ?? 0, label: 'Students' },
        { val: stats?.uptime || '99.9%', label: 'Uptime' }
      ].map(s => (
        <div key={s.label} className="text-center">
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {typeof s.val === 'number' ? s.val.toLocaleString('en-IN') : s.val}
          </p>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </section>
);

// --- Features Section ---
const features = [
  { icon: BookOpen, title: 'Smart Inventory', desc: 'Centralized catalog management with real-time stock levels, ISBN lookups, and category isolation.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Users, title: 'Member Lifecycle', desc: 'Manage registrations, subscription approvals, and detailed activity logs for every member.', color: 'bg-teal-50 text-teal-600' },
  { icon: Zap, title: 'WhatsApp Alerts', desc: 'Automated WhatsApp notifications for membership renewals, overdue books, and announcements.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Coffee, title: 'Desk & Table Management', desc: 'Visual seat allocation and locker tracking to maximize library occupancy and efficiency.', color: 'bg-blue-50 text-blue-600' },
  { icon: IndianRupee, title: 'Double-Entry Ledger', desc: 'Professional accounting system for tracking security deposits, fees, and operational expenses.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: RotateCcw, title: 'Automated Circulation', desc: 'High-speed check-in/out with automated fine calculation and instant digital receipts.', color: 'bg-rose-50 text-rose-600' },
  { icon: Shield, title: 'Multi-Tenant Security', desc: 'Enterprise-grade data isolation ensuring every library branch has its own private, secure database.', color: 'bg-purple-50 text-purple-600' },
  { icon: BarChart2, title: 'Financial Analytics', desc: 'Detailed P&L statements, revenue forecasting, and member growth trends at your fingertips.', color: 'bg-slate-50 text-slate-600' },
];

const Features = () => (
  <section id="features" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-[22px] font-bold text-slate-900 tracking-tight uppercase tracking-[0.2em]">Platform Capabilities</h2>
        <p className="text-[14px] text-slate-500 font-medium mt-2">Packed with powerful features out of the box, built for modern institutions.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="card p-6 hover:border-teal-500/30 transition-all group bg-white">
            <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}><f.icon size={20} /></div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- How It Works ---
const steps = [
  { num: '01', title: 'Add Books', desc: 'Import your entire catalog with simple tools.' },
  { num: '02', title: 'Register Students', desc: 'Onboard members and assign their profiles.' },
  { num: '03', title: 'Assign Memberships', desc: 'Pick a plan and allocate study spaces.' },
  { num: '04', title: 'Track Everything', desc: 'Automate payments, returns, and reports.' }
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-slate-50/50">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <h2 className="text-[22px] font-bold text-slate-900 mb-16 uppercase tracking-wider tracking-[0.3em]">Operational Flow</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
        <div className="hidden lg:block absolute top-6 left-1/4 right-1/4 h-px bg-slate-200" />
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 text-[14px] font-bold text-[#044343]">{s.num}</div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-2">{s.title}</h3>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed px-4">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Pricing Section ---
const Pricing = ({ navigate, plans }) => {
  const [billing, setBilling] = useState('monthly');
  
  const displayPlans = plans.length > 0 ? plans : [
    { name: 'Starter', price: 999, description: 'Basic automation for small libraries.', features: ['Single Library', 'Up to 500 Students', 'Book Management', 'Manual Invoices'] },
    { name: 'Professional', price: 1999, description: 'Complete suite for growing institutions.', features: ['Full Finance Suite', 'Study Desk Management', 'Digital Library', 'Automated Ledgers'], popular: true },
    { name: 'Scale Pro', price: 30, isStudentBased: true, description: 'Pay as you grow with per-student pricing.', features: ['Unlimited Books', 'Pay-per-student', 'All Premium Features', 'Priority Support'] }
  ];

  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-teal-50 border border-teal-100 text-[#044343] text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            Flexible Pricing
          </motion.div>
          <h2 className="text-[32px] md:text-[42px] font-bold text-slate-900 tracking-tight leading-tight">
            Plans that scale with <br className="hidden md:block" /> your <span className="text-[#044343]">institution</span>
          </h2>
          
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-[13px] font-bold transition-colors ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-slate-100 border border-slate-200 rounded-full relative p-1 transition-all hover:border-teal-300"
            >
              <motion.div 
                animate={{ x: billing === 'yearly' ? 28 : 0 }}
                className="w-5 h-5 bg-[#044343] rounded-full shadow-md"
              />
            </button>
            <span className={`text-[13px] font-bold transition-colors ${billing === 'yearly' ? 'text-[#044343]' : 'text-slate-400'}`}>
              Yearly <span className="bg-[#044343] text-white text-[10px] px-2 py-0.5 rounded-full ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayPlans.map((plan, i) => {
            const isStudent = plan.isStudentBased || plan.name.toLowerCase().includes('student');
            const isCustom = plan.price === 'Custom';
            const price = typeof plan.price === 'number' 
              ? (isStudent ? plan.price : (billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price))
              : plan.price;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col p-8 rounded-3xl transition-all duration-500 bg-white border ${
                  plan.popular || isStudent 
                    ? 'border-[#044343] shadow-2xl shadow-teal-900/10' 
                    : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:border-slate-300'
                }`}
              >
                {(plan.popular || isStudent) && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
                    isStudent ? 'bg-indigo-600' : 'bg-[#044343]'
                  }`}>
                    {isStudent ? 'Most Flexible' : 'Most Popular'}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-[15px] font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed min-h-[40px]">
                    {plan.description || (isCustom ? 'Tailored solutions for large scale operations.' : 'Professional features for your library.')}
                  </p>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[20px] font-bold text-slate-400 self-start mt-1">
                      {!isCustom && plan.currency !== 'USD' ? '₹' : ''}
                    </span>
                    <span className="text-[44px] font-black text-slate-900 tracking-tighter leading-none">
                      {typeof price === 'number' ? price.toLocaleString('en-IN') : price}
                    </span>
                    {typeof price === 'number' && (
                      <span className="text-[14px] font-bold text-slate-400 ml-1">
                        {isStudent ? '/student/mo' : '/mo'}
                      </span>
                    )}
                  </div>
                  {billing === 'yearly' && !isStudent && !isCustom && (
                    <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1 uppercase tracking-wider">
                      <Zap size={12} /> Billed annually
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Core Features</p>
                  {((plan.features && Array.isArray(plan.features)) ? plan.features : 
                    Object.entries(plan.features || {}).filter(([_, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1'))
                  ).slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[13px] font-medium text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-[#044343]" />
                      </div>
                      <span className="capitalize">{feature}</span>
                    </div>
                  ))}
                  {isCustom && (
                    <div className="flex items-center gap-3 text-[13px] font-bold text-indigo-600">
                      <Shield size={16} />
                      <span>SLA Guarantee</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/query')}
                  className={`group relative overflow-hidden w-full py-4 rounded-2xl text-[14px] font-bold transition-all duration-300 ${
                    plan.popular || isStudent 
                      ? 'bg-[#044343] text-white hover:bg-slate-900 shadow-lg shadow-teal-900/20' 
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isCustom ? 'Contact Sales' : 'Start Free Trial'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <p className="text-[14px] text-slate-500 font-medium">
            Need a custom quote for 10+ branches? 
            <button onClick={() => navigate('/query')} className="text-[#044343] font-bold ml-1 hover:underline underline-offset-4 decoration-2">
              Talk to our infrastructure team
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

// --- Testimonials ---
const Testimonials = () => (
  <section id="testimonials" className="py-24 bg-slate-50/50 border-y border-slate-100">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
      <div className="md:col-span-1">
        <h2 className="text-[22px] font-bold text-slate-900 leading-tight uppercase tracking-widest">Global Trust</h2>
        <p className="text-[14px] text-slate-500 font-medium mt-3 leading-relaxed">From private study centers in Delhi to college libraries in Mumbai, Welib is the choice of excellence.</p>
      </div>
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { t: "Welib helped us manage 400+ students easily. Memberships and payments are now fully automated.", name: "Library Owner", org: "Delhi Study Center" },
          { t: "The study desk management is a lifesaver. Our students can now book seats without any disputes.", name: "Administrator", org: "IIT Coaching Academy" }
        ].map((t, i) => (
          <div key={i} className="card p-6 bg-white">
            <div className="flex gap-1 mb-4">{Array(5).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}</div>
            <p className="text-[14px] text-slate-700 font-medium leading-relaxed italic mb-6">"{t.t}"</p>
            <div><p className="text-[13px] font-bold text-slate-900">{t.name}</p><p className="text-[11px] font-bold text-slate-400 uppercase">{t.org}</p></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = ({ navigate, stats }) => (
  <section className="py-32 bg-slate-50 text-center border-t border-slate-100">
    <div className="max-w-3xl mx-auto px-6">
      <h2 className="text-[38px] font-bold text-slate-900 tracking-tighter leading-tight italic uppercase">Scale Your Library<br />Operations Today</h2>
      <p className="text-[16px] text-slate-600 font-medium mt-6 mb-10">Join the growing network of {stats?.totalLibraries ?? 0} modern libraries using Welib to automate their management, finance, and member engagement.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={() => navigate('/query')} className="btn btn-primary px-10 py-4 rounded-xl text-[14px] font-bold shadow-xl shadow-teal-900/20">Start 14-Day Free Trial</button>
        <button onClick={() => navigate('/login')} className="btn btn-secondary px-10 py-4 rounded-xl text-[14px] font-bold bg-white">Book a Technical Demo</button>
      </div>
      <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
        <div><p className="text-xl font-black text-slate-900">{stats?.uptime || '99.9%'}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime SLA</p></div>
        <div><p className="text-xl font-black text-slate-900">256-bit</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encryption</p></div>
        <div><p className="text-xl font-black text-slate-900">24/7</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support</p></div>
      </div>
    </div>
  </section>
);

// --- Footer ---
const Footer = ({ navigate }) => (
  <footer className="bg-slate-900 py-16 text-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/appicon.png" alt="Welib" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">Welib</span>
          </div>
          <p className="text-slate-400 text-[13px] font-medium leading-relaxed max-w-xs">Library management, simplified. Modern tools for schools, colleges and study centers.</p>
        </div>
        {[
          { t: 'Product', l: [{ n: 'Features', h: '#features' }, { n: 'Pricing', h: '#pricing' }, { n: 'How it Works', h: '#how-it-works' }, { n: 'Get Started', h: '/query' }] },
          { t: 'Company', l: [{ n: 'About', h: '/about' }, { n: 'Contact', h: '/query' }, { n: 'Support', h: '/app/support' }, { n: 'Privacy', h: '/privacy' }] },
          { t: 'Support Hub', l: [{ n: 'Help Center', h: '/help' }, { n: 'Documentation', h: '/documentation' }, { n: 'Status', h: '/status' }, { n: 'Security', h: '/security' }] }
        ].map(col => (
          <div key={col.t}>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-6">{col.t}</h4>
            <ul className="space-y-4">
              {col.l.map(link => (
                <li key={link.n}>
                  {link.h.startsWith('#') ? (
                    <a href={link.h} className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">{link.n}</a>
                  ) : (
                    <button onClick={() => navigate(link.h)} className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">{link.n}</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-slate-500 text-[12px] font-bold">© 2026 Welib. Built in India for the world.</p>
        <div className="flex items-center gap-6">
          <Twitter size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
          <Linkedin size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
          <Github size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { data: statsData } = useGetPublicStatsQuery();
  const { data: plansData } = useGetPublicPlansQuery();

  const stats = statsData?.data;
  const plans = plansData?.data || [];

  return (
    <div className="font-sans antialiased bg-white selection:bg-teal-100 selection:text-[#044343]">
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} stats={stats} />
      <Stats stats={stats} />
      <Features />
      <HowItWorks />
      <Pricing navigate={navigate} plans={plans} />
      <Testimonials />
      <FinalCTA navigate={navigate} stats={stats} />
      <Footer navigate={navigate} />
    </div>
  );
};

export default LandingPage;
