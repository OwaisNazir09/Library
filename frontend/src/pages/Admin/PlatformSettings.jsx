import React from 'react';
import {
  Settings, Globe, Mail, Clock, DollarSign, ToggleLeft,
  ToggleRight, Save, ChevronRight, Shield, Layers, Flag,
  CreditCard, Key, Smartphone, Bell, Receipt, Code,
  Smartphone as PhoneIcon, Mail as MailIcon, Terminal
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const plans = [
  { id: 'starter', name: 'Starter', price: '₹999', billing: 'Monthly', features: ['Up to 500 students', 'Basic reports', 'Email support'], limits: { students: 500 } },
  { id: 'professional', name: 'Professional', price: '₹2,499', billing: 'Monthly', features: ['Up to 5000 students', 'Advanced reports', 'Priority support', 'Digital library'], limits: { students: 5000 } },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', billing: 'Annual', features: ['Unlimited students', 'Custom integrations', 'Dedicated support', 'All features'], limits: { students: -1 } },
];

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${enabled ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const PlatformSettings = () => {
  const [general, setGeneral] = React.useState({
    platformName: 'Welib Authority',
    supportEmail: 'authority@welib.app',
    trialDays: 14,
    currency: 'INR',
    taxRate: 18,
    taxName: 'GST',
  });

  const [gateways, setGateways] = React.useState({
    razorpayKey: 'rzp_test_7a6b5c4d3e2f1',
    razorpaySecret: '••••••••••••••••••••',
    stripeKey: 'pk_test_51Mz...',
    stripeSecret: '••••••••••••••••••••',
  });

  const [features, setFeatures] = React.useState({
    digitalLibrary: true,
    financeModule: true,
    reports: true,
    multiBranch: false,
    mobileApp: true,
    attendance: true,
  });

  const [activeTab, setActiveTab] = React.useState('general');

  const onSaveGeneral = (e) => {
    e.preventDefault();
    toast.success('Platform architecture updated');
  };

  const tabs = [
    { id: 'general', label: 'Architecture', icon: Settings },
    { id: 'billing', label: 'Billing & Tax', icon: Receipt },
    { id: 'gateways', label: 'Payment Hub', icon: CreditCard },
    { id: 'plans', label: 'Service Tiers', icon: Layers },
    { id: 'features', label: 'Feature Gating', icon: Flag },
    { id: 'email', label: 'Email Control', icon: Mail },
    { id: 'security', label: 'Global Guard', icon: Shield },
    { id: 'api', label: 'API & Webhooks', icon: Code },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Configuration</h1>
        <p className="text-sm font-medium text-slate-500 mt-0.5">Define global behavior, financial rules, and service orchestration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 p-2 bg-white border border-slate-100 rounded-[32px] overflow-x-auto shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                    <Settings size={22} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Core Architecture</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Platform-wide identity and evaluation rules</p>
                 </div>
              </div>
              
              <form onSubmit={onSaveGeneral} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Authority Name</label>
                    <input
                      value={general.platformName}
                      onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                      className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Support Node</label>
                    <input
                      value={general.supportEmail}
                      onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                      className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Trial Threshold</label>
                    <div className="relative">
                       <input
                        value={general.trialDays}
                        onChange={(e) => setGeneral({ ...general, trialDays: e.target.value })}
                        className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                        type="number"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Days</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Timezone</label>
                    <select className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none">
                       <option>Asia/Kolkata (GMT +5:30)</option>
                       <option>UTC (GMT 0)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                    <Save size={16} /> Persist Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Receipt size={22} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Financial Rules</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Taxation and currency settings for all library nodes</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Currency</label>
                    <select
                      value={general.currency}
                      onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                      className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Calculation Label</label>
                    <input
                      value={general.taxName}
                      onChange={(e) => setGeneral({ ...general, taxName: e.target.value })}
                      className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Tax Percentage</label>
                    <div className="relative">
                      <input
                        value={general.taxRate}
                        onChange={(e) => setGeneral({ ...general, taxRate: e.target.value })}
                        className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                        type="number"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Prefix</label>
                    <input defaultValue="WELIB-" className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
              </div>
              <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="flex items-center gap-3 mb-4">
                    <Bell size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Automation Rules</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-[12px] font-black text-slate-700">Auto-generate invoices</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Automated document creation on subscription renewal</p>
                       </div>
                       <ToggleSwitch enabled={true} onChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-[12px] font-black text-slate-700">Late Payment Notifications</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Send alerts 3 days after payment due date</p>
                       </div>
                       <ToggleSwitch enabled={true} onChange={() => {}} />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'gateways' && (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                    <CreditCard size={22} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Payment Hub</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Acquirer credentials and merchant configuration</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <img src="https://razorpay.com/favicon.png" className="w-4 h-4 grayscale" alt="" />
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Razorpay Configuration</span>
                       <span className="ml-auto px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-md tracking-widest">PROD_ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Key ID</label>
                          <div className="relative">
                             <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                             <input value={gateways.razorpayKey} className="w-full bg-slate-50 border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-[12px] font-bold text-slate-700" readOnly />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Secret</label>
                          <div className="relative">
                             <Shield size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                             <input value={gateways.razorpaySecret} className="w-full bg-slate-50 border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-[12px] font-bold text-slate-700" readOnly />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="p-1 bg-indigo-600 rounded-md"><CreditCard size={10} className="text-white" /></div>
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Stripe Orchestration</span>
                       <span className="ml-auto px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase rounded-md tracking-widest">STANDBY</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1.5 opacity-50">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Publishable Key</label>
                          <input value={gateways.stripeKey} className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[12px] font-bold text-slate-700" readOnly />
                       </div>
                       <div className="space-y-1.5 opacity-50">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                          <input value={gateways.stripeSecret} className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[12px] font-bold text-slate-700" readOnly />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                    <Mail size={22} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Email Intelligence</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Transactional communication and template control</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
                          <MailIcon size={18} className="text-slate-400" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">Welcome Template</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">Sent to new librarians after node activation</p>
                       </div>
                    </div>
                    <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit Template</button>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
                          <Terminal size={18} className="text-slate-400" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">Password Reset Flow</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">Automated recovery orchestration</p>
                       </div>
                    </div>
                    <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit Template</button>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
                          <CreditCard size={18} className="text-slate-400" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">Payment Confirmation</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">Receipt delivery after successful capture</p>
                       </div>
                    </div>
                    <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit Template</button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                    <Shield size={22} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Global Guard</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Platform-wide security policies and restrictions</p>
                 </div>
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Expired Node Restriction', desc: 'Deny access to nodes with expired service level agreements', enabled: true },
                  { label: 'Suspended Node Isolation', desc: 'Block all incoming and outgoing telemetry for suspended nodes', enabled: true },
                  { label: 'API Rate Orchestration', desc: 'Apply global throughput limits on node API endpoints', enabled: true },
                  { label: 'Super Admin Identity MFA', desc: 'Enforce multi-factor verification for platform authority accounts', enabled: false },
                  { label: 'Brute-Force Shield', desc: 'Automatically blacklist IPs after 5 failed authentication attempts', enabled: true },
                ].map(({ label, desc, enabled }, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b border-slate-50 last:border-0 group">
                    <div className="transition-transform group-hover:translate-x-1">
                      <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{label}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <ToggleSwitch enabled={enabled} onChange={() => toast.success(`${label} status altered`)} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add more tabs content as needed */}
          {['plans', 'features', 'api'].includes(activeTab) && (
             <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                   <Terminal size={40} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">{activeTab} MODULE</h3>
                <p className="text-sm font-bold text-slate-400 max-w-sm">This architectural component is under maintenance or awaiting data persistence.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
