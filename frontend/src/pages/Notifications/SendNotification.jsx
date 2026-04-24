import React, { useState } from 'react';
import { useSendPushNotificationMutation } from '../../store/api/notificationApi';
import { useGetTenantsQuery } from '../../store/api/adminApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import { Bell, Send, Users, Library, Info, Loader2, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const SendNotification = () => {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === 'super_admin';

  const [sendNotification, { isLoading }] = useSendPushNotificationMutation();
  const { data: tenantsData } = useGetTenantsQuery(undefined, { skip: !isSuperAdmin });
  const { data: usersData } = useGetUsersQuery({ limit: 100 });

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target: isSuperAdmin ? 'all' : 'library',
    libraryId: '',
    userId: ''
  });

  const tenants = tenantsData?.data?.tenants || [];
  const users = usersData?.data?.users || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      return toast.error('Title and message are required');
    }

    if (formData.target === 'single' && !formData.userId) {
      return toast.error('Please select a user');
    }

    try {
      const response = await sendNotification(formData).unwrap();
      toast.success(`Broadcasting... Sent to ${response.data.successCount} devices!`);
      setFormData({ ...formData, title: '', body: '' });
    } catch (err) {
      toast.error(err.data?.message || 'Failed to send notification');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-[#044343]">
             <Bell size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Push Notifications</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {isSuperAdmin 
                ? 'Global broadcast and targeted mobile notifications' 
                : `Send notifications to ${user?.tenantId?.name || 'your library'} members`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Target Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target: 'all' })}
                className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  formData.target === 'all' 
                  ? 'border-[#044343] bg-teal-50/50 text-[#044343]' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <Users size={24} />
                <div className="text-left">
                   <p className="font-bold text-sm">Global</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Everyone</p>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFormData({ ...formData, target: 'library' })}
              className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                formData.target === 'library' 
                ? 'border-[#044343] bg-teal-50/50 text-[#044343]' 
                : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <Library size={24} />
              <div className="text-left">
                 <p className="font-bold text-sm">{isSuperAdmin ? 'Library' : 'All Members'}</p>
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">{isSuperAdmin ? 'Target Tenant' : 'All your users'}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, target: 'single' })}
              className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                formData.target === 'single' 
                ? 'border-[#044343] bg-teal-50/50 text-[#044343]' 
                : 'border-slate-100 hover:border-slate-200 text-slate-500'
              }`}
            >
              <UserIcon size={24} />
              <div className="text-left">
                 <p className="font-bold text-sm">Individual</p>
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Single Member</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isSuperAdmin && formData.target === 'library' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Library</label>
                <select
                  value={formData.libraryId}
                  onChange={(e) => setFormData({ ...formData, libraryId: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-[#044343] transition-colors"
                >
                  <option value="">Choose Library...</option>
                  {tenants.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.target === 'single' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Recipient</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-[#044343] transition-colors"
                >
                  <option value="">Search user...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notification Title</label>
            <input
              type="text"
              placeholder="e.g. Library closed for holiday"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#044343] transition-all outline-none font-bold text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
            <textarea
              rows={4}
              placeholder="Type your message here..."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#044343] transition-all outline-none font-bold text-sm"
            />
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 flex items-start gap-4 border border-amber-100/50">
            <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              This will send a real-time push notification via Firebase Cloud Messaging.
              Only users who have opened the mobile app and granted permissions will receive this.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#044343] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#033636] transition-all shadow-lg shadow-teal-900/10 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            <span className="uppercase tracking-widest text-xs">{isLoading ? 'Sending...' : 'Broadcast Notification'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;
