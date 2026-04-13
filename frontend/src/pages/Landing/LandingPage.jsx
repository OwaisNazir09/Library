import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, RotateCcw, Package, DollarSign, BarChart2,
  Check, ArrowRight, Star, Twitter, Linkedin, Github, Menu, X,
  ChevronRight, Zap, Shield, Globe, Library
} from 'lucide-react';

// ─── Animated Counter ──────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target);
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Navbar ─────────────────────────────────────────────────────────────────
const Navbar = ({ navigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = ['Features', 'How it Works', 'Pricing', 'Testimonials'];
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#044343] flex items-center justify-center">
            <Library size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">LibraryOS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-bold text-slate-600 hover:text-[#044343] transition-colors">{l}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-700 hover:text-[#044343] transition-colors px-4 py-2">
            Sign In
          </button>
          <button onClick={() => navigate('/query')}
            className="bg-[#044343] text-white text-sm font-black px-5 py-2.5 rounded-xl hover:bg-[#033636] shadow-lg shadow-teal-900/20 transition-all active:scale-95">
            Get Started
          </button>
        </div>
        <button className="md:hidden text-slate-700" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-slate-100 px-6 py-6 space-y-4">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="block text-sm font-bold text-slate-700 hover:text-[#044343]"
                onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <button onClick={() => navigate('/query')}
              className="w-full bg-[#044343] text-white text-sm font-black px-5 py-3 rounded-xl">
              Get Started Free
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ─── Hero Section ───────────────────────────────────────────────────────────
const Hero = ({ navigate }) => (
  <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 flex items-center overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-teal-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-slate-100/60 rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-[#044343]/20" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-teal-400/30" />
    </div>
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
        <div className="inline-flex items-center gap-2 bg-[#044343]/8 border border-[#044343]/15 rounded-full px-4 py-1.5 mb-8">
          <Zap size={13} className="text-[#044343]" />
          <span className="text-xs font-black text-[#044343] uppercase tracking-widest">Now with AI-Powered Insights</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
          Modern Library
          <span className="block text-[#044343]">Management,</span>
          Simplified.
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
          Manage books, students, and subscriptions effortlessly in one powerful dashboard. Built for schools, colleges, and private libraries.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/query')}
            className="flex items-center gap-2 bg-[#044343] text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-teal-900/25 hover:bg-[#033636] transition-all active:scale-95 text-sm">
            Get Started Free <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-white text-slate-700 font-black px-8 py-4 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-sm">
            View Demo
          </button>
        </div>
        <div className="flex items-center gap-6 mt-10">
          {['No credit card required', 'Free 30-day trial', 'Cancel anytime'].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Check size={13} className="text-emerald-500" /> {t}
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:block">
        <div className="relative">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
            <div className="bg-[#044343] px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white/10 rounded-lg h-6 flex items-center px-3">
                <span className="text-white/70 text-[10px] font-bold">app.libraryos.com/dashboard</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Books', val: '4,208', col: 'bg-indigo-50 text-indigo-600' },
                  { label: 'Active Students', val: '1,204', col: 'bg-teal-50 text-teal-600' },
                  { label: 'Revenue', val: '$8,450', col: 'bg-rose-50 text-rose-600' },
                ].map(c => (
                  <div key={c.label} className={`${c.col} rounded-2xl p-4`}>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{c.label}</p>
                    <p className="text-xl font-black mt-1">{c.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Borrowings</p>
                {['Introduction to Algorithms', 'Clean Code', '1984', 'Pride and Prejudice'].map((title, i) => (
                  <div key={title} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-bold text-slate-700 truncate">{title}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {i % 2 === 0 ? 'Returned' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This Month</p>
              <p className="text-lg font-black text-slate-900">+23% Growth</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Stats Strip ────────────────────────────────────────────────────────────
const Stats = () => (
  <section className="bg-[#044343] py-16">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
      {[
        { val: 500, suffix: '+', label: 'Libraries Onboarded' },
        { val: 50000, suffix: '+', label: 'Books Managed' },
        { val: 12000, suffix: '+', label: 'Active Students' },
        { val: 99, suffix: '.9%', label: 'Uptime Guaranteed' },
      ].map(s => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-4xl font-black text-white mb-2">
            <AnimatedCounter target={s.val} suffix={s.suffix} />
          </p>
          <p className="text-sm font-bold text-teal-200 uppercase tracking-widest">{s.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

// ─── Features Section ───────────────────────────────────────────────────────
const features = [
  { icon: BookOpen, title: 'Book Management', desc: 'Add, update, and track every book in your collection with rich metadata and copy tracking.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Users, title: 'Student Registration', desc: 'Register students with complete profiles, subscription plans, and membership history.', color: 'bg-teal-50 text-teal-600' },
  { icon: RotateCcw, title: 'Borrow & Return', desc: 'Seamless book checkout and return flow with automated due dates and instant alerts.', color: 'bg-amber-50 text-amber-600' },
  { icon: Package, title: 'Package Management', desc: 'Create flexible subscription plans — monthly, quarterly — and assign them to students.', color: 'bg-purple-50 text-purple-600' },
  { icon: DollarSign, title: 'Fines & Fees', desc: 'Auto-calculate late return fines, track payment status, and generate financial ledgers.', color: 'bg-rose-50 text-rose-600' },
  { icon: BarChart2, title: 'Reports & Analytics', desc: 'Beautiful charts and summaries to understand your library usage and revenue at a glance.', color: 'bg-emerald-50 text-emerald-600' },
];

const Features = () => (
  <section id="features" className="py-32 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[10px] font-black text-[#044343] uppercase tracking-[0.25em] bg-teal-50 px-4 py-2 rounded-full">Everything You Need</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-6 leading-tight">Packed with powerful<br />features out of the box</h2>
          <p className="text-xl text-slate-500 font-medium mt-4 max-w-2xl mx-auto">All the tools your librarians need to run a modern, efficient institution — in one place.</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group cursor-pointer">
            <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <f.icon size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-3">{f.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">{f.desc}</p>
            <div className="flex items-center gap-1 mt-6 text-[#044343] font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more <ChevronRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── How It Works ────────────────────────────────────────────────────────────
const steps = [
  { num: '01', icon: BookOpen, title: 'Add Books', desc: 'Upload your entire book catalog with ISBNs, authors, and available stock.' },
  { num: '02', icon: Users, title: 'Register Students', desc: 'Onboard students with profiles, contact info, and membership assignments.' },
  { num: '03', icon: Package, title: 'Assign Packages', desc: 'Pick a subscription plan — monthly or quarterly — and assign it instantly.' },
  { num: '04', icon: RotateCcw, title: 'Issue & Track Books', desc: 'Checkout books with one click. Track returns, fines, and overdue alerts.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-32 bg-slate-50/60">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[10px] font-black text-[#044343] uppercase tracking-[0.25em] bg-teal-50 px-4 py-2 rounded-full">Simple Process</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-6">Up and running<br />in minutes</h2>
          <p className="text-xl text-slate-500 font-medium mt-4">Four simple steps to transform your library operations.</p>
        </motion.div>
      </div>
      <div className="relative">
        <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div key={s.num}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center relative">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-lg flex items-center justify-center group-hover:border-[#044343] transition-colors">
                  <s.icon size={24} className="text-[#044343]" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#044343] text-white text-[9px] font-black rounded-full flex items-center justify-center">{s.num}</div>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">{s.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Pricing ─────────────────────────────────────────────────────────────────
const allFeatures = [
  'Unlimited books & catalog management',
  'Student registration & profiles',
  'Borrow & return tracking',
  'Subscription package management',
  'Automated fines & fees ledger',
  'Reports & analytics dashboard',
  'Overdue reminders & notifications',
  'Multiple librarian accounts',
  'Multi-branch support',
  'Priority customer support',
  'Data export & backups',
  'No setup fee — cancel anytime',
];

const Pricing = ({ navigate }) => (
  <section id="pricing" className="py-32 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[10px] font-black text-[#044343] uppercase tracking-[0.25em] bg-teal-50 px-4 py-2 rounded-full">Simple Pricing</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-6">One plan.<br />Everything included.</h2>
          <p className="text-xl text-slate-500 font-medium mt-4">No tiers, no surprises. Pay one flat rate and unlock the full platform.</p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-[#044343] rounded-[3rem] p-12 shadow-2xl shadow-teal-900/30 overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div>
                <span className="text-[10px] font-black text-teal-300 uppercase tracking-[0.25em]">All-Inclusive Plan</span>
                <div className="flex items-end gap-2 mt-3">
                  <span className="text-7xl font-black text-white leading-none">$9</span>
                  <div className="mb-2">
                    <span className="text-teal-300 font-bold text-lg">/month</span>
                    <p className="text-teal-400 text-xs font-bold mt-1">per library</p>
                  </div>
                </div>
                <p className="text-teal-200 font-medium text-sm mt-4 max-w-xs">Every feature, every update, zero restrictions. Built for institutions of all sizes.</p>
              </div>
              <button onClick={() => navigate('/query')}
                className="flex items-center justify-center gap-2 bg-white text-[#044343] font-black px-10 py-5 rounded-2xl text-sm shadow-2xl hover:bg-teal-50 transition-all active:scale-95 whitespace-nowrap">
                Get Started Free <ArrowRight size={16} />
              </button>
            </div>

            <div className="border-t border-white/10 pt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {allFeatures.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-teal-300" />
                  </div>
                  <span className="text-sm font-bold text-teal-100">{f}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-teal-400 text-xs font-bold mt-10">
              No credit card required · 30-day free trial · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Dr. Sarah Ahmed', role: 'Head Librarian, IBA University', avatar: 'SA', rating: 5, text: 'LibraryOS transformed how we manage our 40,000-book catalog. The student registration and borrow tracking is incredibly intuitive. We cut admin time by 60%.' },
  { name: 'Usman Farooq', role: 'Principal, The City School', avatar: 'UF', rating: 5, text: 'From day one the onboarding was seamless. The subscription packages, fine tracking, and analytics reports give us complete visibility across all three branches.' },
  { name: 'Ms. Fatima Noor', role: 'Library Manager, Punjab University', avatar: 'FN', rating: 5, text: 'The overdue reminders and fines ledger alone justified the subscription cost. Our return rate jumped by 40% in the first month. Absolutely worth it.' },
];

const Testimonials = () => (
  <section id="testimonials" className="py-32 bg-slate-50/60">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[10px] font-black text-[#044343] uppercase tracking-[0.25em] bg-teal-50 px-4 py-2 rounded-full">Loved by Libraries</span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-6">Trusted by institutions<br />across the country</h2>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div key={t.name}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-1 mb-6">
              {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-slate-700 font-medium leading-relaxed mb-8 text-sm">"{t.text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#044343] text-white flex items-center justify-center font-black text-sm">{t.avatar}</div>
              <div>
                <p className="font-black text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA = ({ navigate }) => (
  <section className="py-32 bg-[#044343] relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
    </div>
    <div className="max-w-4xl mx-auto px-6 text-center relative">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <Shield size={13} className="text-teal-300" />
          <span className="text-xs font-black text-teal-200 uppercase tracking-widest">Secure & Multi-Tenant</span>
        </div>
        <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">Start Managing Your<br />Library Today</h2>
        <p className="text-xl text-teal-200 font-medium mb-12 max-w-2xl mx-auto">Join 500+ institutions already using LibraryOS. No setup fees, no long contracts.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/query')}
            className="bg-white text-[#044343] font-black px-10 py-5 rounded-2xl text-sm shadow-2xl hover:bg-teal-50 transition-all active:scale-95 flex items-center gap-2">
            Get Started Free <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')}
            className="border border-white/30 text-white font-black px-10 py-5 rounded-2xl text-sm hover:bg-white/10 transition-all">
            Sign In to Dashboard
          </button>
        </div>
        <p className="text-teal-300 text-xs font-bold mt-6">No credit card required · 30-day free trial · Cancel anytime</p>
      </motion.div>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-slate-900 py-16">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#044343] flex items-center justify-center">
              <Library size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-white">LibraryOS</span>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">Modern library management for modern institutions.</p>
          <div className="flex items-center gap-3 mt-6">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all">
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        {[
          { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
          { title: 'Support', links: ['Documentation', 'Help Center', 'Contact Us', 'Status'] },
        ].map(col => (
          <div key={col.title}>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">{col.title}</p>
            <div className="space-y-3">
              {col.links.map(l => (
                <a key={l} href="#" className="block text-sm font-bold text-slate-500 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm font-bold">© 2026 LibraryOS. All rights reserved.</p>
        <div className="flex items-center gap-6">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
            <a key={l} href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="font-sans antialiased">
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing navigate={navigate} />
      <Testimonials />
      <FinalCTA navigate={navigate} />
      <Footer />
    </div>
  );
};

export default LandingPage;
