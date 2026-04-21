import React from 'react';
import {
  Settings, Globe, Mail, Clock, DollarSign, ToggleLeft,
  ToggleRight, Save, ChevronRight, Shield, Layers, Flag
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
    className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-[#044343]' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const PlatformSettings = () => {
  const [general, setGeneral] = React.useState({
    platformName: 'Welib',
    supportEmail: 'support@welib.app',
    trialDays: 14,
    currency: 'INR',
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
    toast.success('Platform settings saved');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'plans', label: 'Pricing Plans', icon: Layers },
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'domain', label: 'Domain & Email', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure global platform behaviour, pricing, and feature availability.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-52 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-[13px] font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#044343] text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">General Settings</h3>
              <form onSubmit={onSaveGeneral} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Platform Name</label>
                    <input
                      value={general.platformName}
                      onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Support Email</label>
                    <input
                      value={general.supportEmail}
                      onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                      className="input"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="label">Default Trial Days</label>
                    <input
                      value={general.trialDays}
                      onChange={(e) => setGeneral({ ...general, trialDays: e.target.value })}
                      className="input"
                      type="number"
                      min={1}
                      max={90}
                    />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select
                      value={general.currency}
                      onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                      className="input"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="btn btn-primary btn-md px-6">
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Pricing Plans</h3>
              {plans.map((plan) => (
                <div key={plan.id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{plan.billing} billing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#044343]">{plan.price}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">per month</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.features.map((f, i) => (
                      <span key={i} className="badge badge-neutral">{f}</span>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button className="btn btn-secondary btn-sm px-4">Edit Plan</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Global Feature Flags</h3>
              <p className="text-[12px] text-slate-400 mb-6">Toggle platform-wide modules. These apply as defaults for new library nodes.</p>
              <div className="space-y-0 divide-y divide-slate-100">
                {[
                  { key: 'digitalLibrary', label: 'Digital Library', desc: 'Allow libraries to upload and manage digital resources' },
                  { key: 'financeModule', label: 'Finance & Ledger', desc: 'Enable fee management and student billing' },
                  { key: 'reports', label: 'Advanced Reports', desc: 'Enable analytics and report generation' },
                  { key: 'multiBranch', label: 'Multi-Branch', desc: 'Allow libraries to manage multiple physical branches' },
                  { key: 'mobileApp', label: 'Mobile Application', desc: 'Allow access via the Welib mobile app' },
                  { key: 'attendance', label: 'Attendance Tracking', desc: 'QR-based student attendance management' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <ToggleSwitch
                      enabled={features[key]}
                      onChange={(v) => {
                        setFeatures({ ...features, [key]: v });
                        toast.success(`${label} ${v ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'domain' && (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Domain & Email Settings</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Base Domain</label>
                  <input defaultValue="welib.app" className="input" disabled />
                  <p className="text-[11px] text-slate-400 mt-1.5">Library nodes are issued as <strong>subdomain.welib.app</strong></p>
                </div>
                <div>
                  <label className="label">SMTP From Address</label>
                  <input defaultValue="noreply@welib.app" className="input" />
                </div>
                <div>
                  <label className="label">SMTP Host</label>
                  <input placeholder="smtp.yourhost.com" className="input" />
                </div>
                <div className="flex justify-end pt-2">
                  <button className="btn btn-primary btn-md px-6" onClick={() => toast.success('Domain settings saved')}>
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Security Settings</h3>
              <div className="space-y-0 divide-y divide-slate-100">
                {[
                  { label: 'Enforce Login Restriction on Expired Tenants', desc: 'Block login for libraries with expired subscriptions', enabled: true },
                  { label: 'Enforce Login Restriction on Suspended Tenants', desc: 'Block all API access for suspended library nodes', enabled: true },
                  { label: 'Rate Limiting (API)', desc: 'Apply rate limiting on all public and authenticated endpoints', enabled: true },
                  { label: 'Require Super Admin MFA', desc: 'Require two-factor authentication for super admin accounts', enabled: false },
                ].map(({ label, desc, enabled }, i) => (
                  <div key={i} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <ToggleSwitch enabled={enabled} onChange={() => toast.success(`${label} updated`)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
