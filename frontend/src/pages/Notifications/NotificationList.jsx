import React from 'react';
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';

const NotificationList = () => {
  const notifications = [
    { type: 'info', title: 'New Arrival', message: 'The book "Deep Work" is now available.', time: '5m ago', read: false },
    { type: 'warning', title: 'Overdue Alert', message: 'You have 3 books overdue for return.', time: '2h ago', read: false },
    { type: 'success', title: 'Return Confirmed', message: 'Successfully returned "Atomic Habits".', time: '1d ago', read: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <button className="text-indigo-600 font-bold text-sm hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border transition-all flex items-start gap-4 ${
            n.read ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-indigo-100 shadow-lg shadow-indigo-500/5'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              n.type === 'info' ? 'bg-blue-50 text-blue-500' :
              n.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
            }`}>
              {n.type === 'info' && <Info size={24} />}
              {n.type === 'warning' && <AlertTriangle size={24} />}
              {n.type === 'success' && <Check size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900">{n.title}</h3>
                <span className="text-xs text-slate-400 font-medium">{n.time}</span>
              </div>
              <p className="text-slate-500 mt-1">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
