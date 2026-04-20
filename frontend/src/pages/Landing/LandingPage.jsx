import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, RotateCcw, Package, IndianRupee, BarChart2,
  Check, ArrowRight, Star, Twitter, Linkedin, Github, Menu, X,
  ChevronRight, Zap, Shield, Globe, Library, Download, Layout,
  Coffee, CreditCard, HeadphonesIcon, HelpCircle
} from 'lucide-react';

// --- Navbar Component ---
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
        <div className="flex items-center gap-2">
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
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden bg-white border-t border-slate-100 px-6 py-6 space-y-4">
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
const Hero = ({ navigate }) => (
  <section className="relative pt-32 pb-20 overflow-hidden bg-white">
    <div className="max-w-7xl mx-auto px-6 text-center lg:text-left grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-[34px] lg:text-[48px] font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight">
          Modern Library Management<br />
          <span className="text-[#044343]">Built for Growing Libraries</span>
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
           <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> 30-day free trial</div>
           <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Cancel anytime</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative hidden lg:block">
        <div className="card p-0 shadow-2xl border-slate-100 overflow-hidden scale-105 origin-center">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-3">
             <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /></div>
             <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-1 text-[10px] text-slate-400 font-bold">app.welib.com/dashboard</div>
          </div>
          <div className="p-6 bg-white space-y-6">
             <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Books</p>
                   <p className="text-xl font-bold text-slate-900 mt-1">4,208</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                   <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Students</p>
                   <p className="text-xl font-bold text-slate-900 mt-1">1,204</p>
                </div>
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                   <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Revenue</p>
                   <p className="text-xl font-bold text-slate-900 mt-1">₹2,45,000</p>
                </div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Borrowings</p>
                {[
                  { t: 'Introduction to Algorithms', s: 'Aman Gupta', status: 'returned' },
                  { t: 'Clean Code', s: 'Rohan Sharma', status: 'active' },
                  { t: 'Atomic Habits', s: 'Fatima Khan', status: 'active' },
                  { t: 'Rich Dad Poor Dad', s: 'Ananya Roy', status: 'returned' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0"><p className="text-[12px] font-bold text-slate-800 truncate">{item.t}</p><p className="text-[10px] text-slate-400 font-medium">{item.s}</p></div>
                    <span className={`badge ${item.status === 'returned' ? 'badge-success' : 'badge-warning'} lowercase`}>{item.status}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 card p-4 flex items-center gap-3 shadow-xl border-slate-100 animate-bounce-slow">
           <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><BarChart2 size={20} /></div>
           <div><p className="text-[10px] font-bold text-slate-400 uppercase">Growth</p><p className="text-lg font-bold text-slate-900">+23% Up</p></div>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- Stats Strip ---
const Stats = () => (
  <section className="bg-white border-y border-slate-50 py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { val: '500+', label: 'Libraries' },
        { val: '50,000+', label: 'Books Managed' },
        { val: '12,000+', label: 'Students' },
        { val: '99.9%', label: 'Uptime' }
      ].map(s => (
        <div key={s.label} className="text-center">
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.val}</p>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </section>
);

// --- Features Section ---
const features = [
  { icon: BookOpen, title: 'Book Management', desc: 'Full inventory control with metadata, stock tracking, and ISBN support.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Users, title: 'Student Management', desc: 'Detailed member profiles, subscription history, and activity logs.', color: 'bg-teal-50 text-teal-600' },
  { icon: Package, title: 'Membership Packages', desc: 'Flexible plans (Monthly/Yearly) with automated expiry alerts.', color: 'bg-amber-50 text-amber-600' },
  { icon: Coffee, title: 'Study Desk Management', desc: 'Visual desk allocation, locker tracking, and occupancy reports.', color: 'bg-blue-50 text-blue-600' },
  { icon: IndianRupee, title: 'Finance & Ledger', desc: 'Professional accounting for payments, fees, and operational costs.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: RotateCcw, title: 'Book Circulation', desc: 'Fast check-in/out with automated fine calculation for late returns.', color: 'bg-rose-50 text-rose-600' },
  { icon: Globe, title: 'Digital Library', desc: 'Upload and share PDFs, notes, and e-books with library members.', color: 'bg-purple-50 text-purple-600' },
  { icon: BarChart2, title: 'Reports & Analytics', desc: 'Instant P&L statements, growth trends, and student participation.', color: 'bg-slate-50 text-slate-600' },
];

const Features = () => (
  <section id="features" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Everything You Need to Run Your Library</h2>
        <p className="text-[14px] text-slate-500 font-medium mt-2">Packed with powerful features out of the box, built for modern institutions.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="card p-6 hover:border-teal-500/30 transition-all group">
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
      <h2 className="text-[22px] font-bold text-slate-900 mb-16 uppercase tracking-wider">How It Works</h2>
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
const Pricing = ({ navigate }) => {
  const [billing, setBilling] = useState('monthly');
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-[22px] font-bold text-slate-900">Simple, Transparent Pricing</h2>
          <div className="mt-6 flex items-center justify-center gap-3">
             <span className={`text-[12px] font-bold ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
             <button onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')} className="w-10 h-5 bg-slate-200 rounded-full relative p-0.5"><div className={`w-4 h-4 bg-white rounded-full transition-all ${billing === 'yearly' ? 'translate-x-5' : 'translate-x-0'}`} /></button>
             <span className={`text-[12px] font-bold ${billing === 'yearly' ? 'text-[#044343]' : 'text-slate-400'}`}>Yearly <span className="bg-teal-100 text-[#044343] text-[9px] px-1.5 py-0.5 rounded ml-1">Save 20%</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
           {[
             { name: 'Starter', price: 999, features: ['Single Library', 'Up to 500 Students', 'Book Management', 'Manual Invoices'] },
             { name: 'Professional', price: 1999, features: ['Full Finance Suite', 'Study Desk Management', 'Digital Library', 'Automated Ledgers'], popular: true },
             { name: 'Enterprise', price: 'Custom', features: ['Multi-branch Sync', 'Custom Domain', 'SSO Integration', '24/7 Priority Support'] }
           ].map((plan, i) => (
             <div key={i} className={`card p-8 flex flex-col ${plan.popular ? 'border-[#044343] ring-1 ring-[#044343]/10 relative' : ''}`}>
               {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#044343] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</span>}
               <h3 className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">{plan.name}</h3>
               <div className="mt-4 mb-8">
                  <span className="text-3xl font-bold text-slate-900">{typeof plan.price === 'number' ? `₹${billing === 'yearly' ? (plan.price * 0.8).toFixed(0) : plan.price}` : plan.price}</span>
                  {typeof plan.price === 'number' && <span className="text-slate-400 font-bold text-sm">/month</span>}
               </div>
               <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-[13px] font-medium text-slate-600"><Check size={14} className="text-emerald-500 shrink-0" /> {f}</li>
                  ))}
               </ul>
               <button onClick={() => navigate('/query')} className={`btn btn-md w-full rounded-lg text-[13px] font-bold ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                 {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
               </button>
             </div>
           ))}
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
          <h2 className="text-[22px] font-bold text-slate-900 leading-tight">Trusted by Leading Institutes Across India</h2>
          <p className="text-[14px] text-slate-500 font-medium mt-3">From private study centers in Delhi to college libraries in Mumbai, Welib is the #1 choice.</p>
       </div>
       <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { t: "Welib helped us manage 400+ students easily. Memberships and payments are now fully automated.", name: "Library Owner", org: "Delhi Study Center" },
            { t: "The study desk management is a lifesaver. Our students can now book seats without any disputes.", name: "Administrator", org: "IIT Coaching Academy" }
          ].map((t, i) => (
            <div key={i} className="card p-6">
               <div className="flex gap-1 mb-4">{Array(5).fill(0).map((_,j)=><Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}</div>
               <p className="text-[14px] text-slate-700 font-medium leading-relaxed italic mb-6">"{t.t}"</p>
               <div><p className="text-[13px] font-bold text-slate-900">{t.name}</p><p className="text-[11px] font-bold text-slate-400 uppercase">{t.org}</p></div>
            </div>
          ))}
       </div>
    </div>
  </section>
);

// --- CTA Section ---
const FinalCTA = ({ navigate }) => (
  <section className="py-32 bg-white text-center">
    <div className="max-w-2xl mx-auto px-6">
      <h2 className="text-[34px] font-bold text-slate-900 tracking-tight leading-tight">Start Managing Your<br />Library Today</h2>
      <p className="text-[16px] text-slate-500 font-medium mt-6 mb-10">No setup fees. No hidden costs. Join 500+ libraries building a modern experience for their students.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={() => navigate('/query')} className="btn btn-primary px-10 py-4 rounded-xl text-[14px] font-bold shadow-lg shadow-teal-900/10">Get Started Free</button>
        <button onClick={() => navigate('/login')} className="btn btn-secondary px-10 py-4 rounded-xl text-[14px] font-bold">Book a Demo</button>
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-8">Cloud-Based SaaS · 99.9% Uptime · SSL Secured</p>
    </div>
  </section>
);

// --- Footer ---
const Footer = () => (
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
          { t: 'Product', l: [{n:'Features', h:'#features'}, {n:'Pricing', h:'#pricing'}, {n:'How it Works', h:'#how-it-works'}, {n:'Get Started', h:'/query'}] },
          { t: 'Company', l: [{n:'About', h:'#features'}, {n:'Contact', h:'/query'}, {n:'Careers', h:'#'}, {n:'Legal', h:'#'}] },
          { t: 'Support', l: [{n:'Help Center', h:'#'}, {n:'Documentation', h:'#'}, {n:'Status', h:'#'}, {n:'Security', h:'#'}] }
        ].map(col => (
          <div key={col.t}>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-6">{col.t}</h4>
            <ul className="space-y-4">
              {col.l.map(link => (
                <li key={link.n}>
                  <a href={link.h} className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
                    {link.n}
                  </a>
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
  return (
    <div className="font-sans antialiased bg-white selection:bg-teal-100 selection:text-[#044343]">
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
