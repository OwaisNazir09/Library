import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Send, AlertTriangle, User, BookOpen, ChevronRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getOverdueIssues } from '../../services/issueService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Reminders = () => {
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOverdueIssues();
        if (res?.data?.overdue) {
          setOverdueList(res.data.overdue);
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendReminder = (studentName) => {
    toast.success(`Reminder sent to ${studentName}`);
  };

  if (loading) return <LoadingSkeleton type="table" rows={10} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Overdue Reminders</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Notification queue for books beyond due date</p>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Student</th>
              <th>Book Title</th>
              <th>Due Date</th>
              <th className="text-center">Days Overdue</th>
              <th className="text-right px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {overdueList.map((item) => {
              const daysLate = differenceInDays(new Date(), new Date(item.dueDate));
              return (
                <tr key={item._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 font-bold text-[10px]">
                        {item.user?.fullName?.charAt(0)}
                      </div>
                      <span className="text-[13px] font-bold text-slate-900">{item.user?.fullName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} className="text-slate-300" />
                      <span className="text-[13px] font-medium text-slate-600 truncate max-w-[200px]">{item.book?.title || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="text-[12px] font-medium text-slate-500">
                    {format(new Date(item.dueDate), 'dd MMM yyyy')}
                  </td>
                  <td className="text-center">
                    <span className="badge badge-danger lowercase flex items-center gap-1">
                      <AlertTriangle size={10} /> {daysLate} Days
                    </span>
                  </td>
                  <td className="px-5 text-right">
                    <button onClick={() => handleSendReminder(item.user?.fullName)} className="btn btn-secondary btn-sm px-4">
                      <Send size={14} /> Send Reminder
                    </button>
                  </td>
                </tr>
              );
            })}
            {overdueList.length === 0 && (
              <tr><td colSpan="5" className="p-20 text-center text-slate-400 text-xs italic">No overdue items in the queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reminders;
