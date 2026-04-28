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
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Feed</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Real-time logs and system alerts.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllRead}
            disabled={isMarking}
            className="btn btn-secondary btn-sm h-9 px-4 rounded-xl"
          >
            {isMarking && <Loader2 size={14} className="animate-spin" />}
            Mark all read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.map((n, i) => (
          <div key={n._id || i} className={`card p-5 transition-all flex items-start gap-5 group hover:border-slate-300 ${
            n.isRead ? 'opacity-60 grayscale-[0.5]' : ''
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100 transition-transform group-hover:scale-110 ${
              n.type === 'info' ? 'bg-sky-50 text-sky-600' :
              n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 
              'bg-emerald-50 text-emerald-600'
            }`}>
              {n.type === 'info' && <Info size={18} />}
              {n.type === 'warning' && <AlertTriangle size={18} />}
              {n.type === 'success' && <Check size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-[#044343] transition-colors">{n.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{n.time}</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-2 leading-relaxed font-medium">{n.message}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="card py-20 flex flex-col items-center border-dashed border-2">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
               <Bell size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No activity detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
