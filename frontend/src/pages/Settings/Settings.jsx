import React from 'react';
import { User, Bell, Shield, Palette, Database } from 'lucide-react';

const Settings = () => {
  const sections = [
    { icon: User, name: 'Profile Settings', desc: 'Manage your public profile and avatar.' },
    { icon: Bell, name: 'Notifications', desc: 'Configure how you receive alerts and updates.' },
    { icon: Shield, name: 'Security', desc: 'Update your password and 2FA settings.' },
    { icon: Palette, name: 'Appearance', desc: 'Toggle dark mode and accent colors.' },
    { icon: Database, name: 'Data Storage', desc: 'Manage your library database exports.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Global configuration for your library portal.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex items-center gap-6">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-colors">
              <section.icon size={26} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{section.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{section.desc}</p>
            </div>
            <button className="text-slate-300 group-hover:text-indigo-400 transition-colors">
              <Shield size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
