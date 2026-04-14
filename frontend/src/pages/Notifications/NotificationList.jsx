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
    } catch (err) {
      // Handled globally
    }
  };

  if (loading && notifications.length === 0) return <LoadingSkeleton type="card" rows={5} />;
  if (error) return <ErrorState message={error.data?.message || 'Error loading notifications'} onRetry={refetch} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllRead}
            disabled={isMarking}
            className="text-[#044343] font-bold text-sm hover:underline disabled:opacity-50 flex items-center gap-2"
          >
            {isMarking && <Loader2 size={14} className="animate-spin" />}
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div key={n._id || i} className={`p-6 rounded-[2rem] border transition-all flex items-start gap-4 ${
            n.isRead ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-indigo-100 shadow-lg shadow-indigo-500/5'
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
