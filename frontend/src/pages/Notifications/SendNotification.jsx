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
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {isSuperAdmin 
              ? 'Global broadcast and targeted mobile notifications' 
              : `Send notifications to ${user?.tenantId?.name || 'your library'} members`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Card */}
        <div className="card p-6 lg:col-span-1 space-y-6">
          <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest mb-4">Targeting</h3>
          
          <div className="space-y-3">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target: 'all' })}
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  formData.target === 'all' 
                  ? 'border-[#044343] bg-teal-50/50 text-[#044343]' 
                  : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.target === 'all' ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                  <Users size={18} />
                </div>
                <div className="text-left">
                   <p className="font-bold text-sm leading-tight">Global</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-0.5">Broadcast to all</p>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFormData({ ...formData, target: 'library' })}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                formData.target === 'library' 
                ? 'border-[#044343] bg-teal-50/50 text-[#044343]' 
                : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.target === 'library' ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                <Library size={18} />
              </div>
              <div className="text-left">
                 <p className="font-bold text-sm leading-tight">{isSuperAdmin ? 'Library' : 'All Members'}</p>
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-0.5">{isSuperAdmin ? 'Target Tenant' : 'Every student'}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, target: 'single' })}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                formData.target === 'single' 
                ? 'border-[#044343] bg-teal-50/50 text-[#044343]' 
                : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.target === 'single' ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                <UserIcon size={18} />
              </div>
              <div className="text-left">
                 <p className="font-bold text-sm leading-tight">Individual</p>
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-0.5">Single Member</p>
              </div>
            </button>
          </div>

          {(formData.target === 'library' || formData.target === 'single') && (
            <div className="pt-6 border-t border-slate-50 space-y-4">
              {isSuperAdmin && formData.target === 'library' && (
                <div className="space-y-2">
                  <label className="label">Select Library</label>
                  <select
                    value={formData.libraryId}
                    onChange={(e) => setFormData({ ...formData, libraryId: e.target.value })}
                    className="input"
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
                  <label className="label">Select Recipient</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="input"
                  >
                    <option value="">Search user...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Card */}
        <div className="lg:col-span-2 card p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#044343] flex items-center justify-center shadow-sm">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Compose Message</h3>
                <p className="text-xs text-slate-400 font-medium">Craft your push notification content.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="label uppercase tracking-widest text-[10px] font-bold text-slate-400">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. System Update or Holiday Notice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input h-12 px-4 font-semibold text-slate-900 bg-slate-50/50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="label uppercase tracking-widest text-[10px] font-bold text-slate-400">Message Body</label>
                <textarea
                  rows={6}
                  placeholder="Type the message content here..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="input h-auto py-4 px-4 font-semibold text-slate-900 bg-slate-50/50 border-slate-200 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 flex items-start gap-4 border border-amber-100/50">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                <Info className="text-amber-500" size={16} />
              </div>
              <p className="text-[11px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                Notifications are sent in real-time. Only users who have granted permissions on the mobile app will receive this broadcast.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary h-12 px-10 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/10 min-w-[200px]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={18} />
                    <span className="uppercase tracking-widest ml-2">Broadcast Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
