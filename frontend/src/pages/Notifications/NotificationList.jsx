import React from 'react';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../../store/api/notificationApi';
import { Bell, Check, Info, AlertTriangle, Loader2 } from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { toast } from 'react-hot-toast';

const NotificationList = () => {
  const { data: notificationsData, isLoading: loading, error, refetch } = useGetNotificationsQuery();
  const [markAsReadMutation, { isLoading: isMarking }] = useMarkAsReadMutation();

  const notifications = notificationsData?.data?.notifications || [];

  const handleMarkAllRead = async () => {
    try {
      await markAsReadMutation().unwrap();
      toast.success('All notifications marked as read');
    } catch (err) { }
  };

  if (loading && notifications.length === 0) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-8 w-48 bg-slate-100 animate-pulse rounded mb-6" />
      <LoadingSkeleton type="card" rows={5} />
    </div>
  );
  
  if (error) return <ErrorState message={error.data?.message || 'Error loading notifications'} onRetry={refetch} />;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Stay updated with library activity and reminders</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllRead}
            disabled={isMarking}
            className="btn btn-ghost btn-sm text-[#044343] font-bold"
          >
            {isMarking && <Loader2 size={14} className="animate-spin" />}
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={n._id || i} className={`card p-4 transition-all flex items-start gap-4 ${
            n.isRead ? 'opacity-60 bg-slate-50/50' : 'border-teal-500/20 bg-white shadow-sm'
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              n.type === 'info' ? 'bg-blue-50 text-blue-500 border-blue-100' :
              n.type === 'warning' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
              'bg-emerald-50 text-emerald-500 border-emerald-100'
            }`}>
              {n.type === 'info' && <Info size={16} />}
              {n.type === 'warning' && <AlertTriangle size={16} />}
              {n.type === 'success' && <Check size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-[13.5px] font-bold text-slate-900 leading-tight">{n.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mt-0.5">{n.time}</span>
              </div>
              <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="card py-16 flex flex-col items-center">
            <Bell size={40} className="text-slate-100 mb-3" />
            <p className="text-sm font-medium text-slate-400">Your notification tray is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
