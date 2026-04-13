import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Send, AlertTriangle, User, BookOpen } from 'lucide-react';
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
      } catch (err) {
        console.warn("API not available or failed.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendReminder = (studentName) => {
    toast.success(`Reminder sent to ${studentName}`);
  };

  if (loading) return <LoadingSkeleton type="table" rows={5} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overdue Reminders</h1>
          <p className="text-slate-500 font-medium">Students who have not returned books on time.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Student Name</th>
                <th className="px-6 py-5">Book Name</th>
                <th className="px-6 py-5">Due Date</th>
                <th className="px-6 py-5">Days Late</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {overdueList.map((item) => {
                const daysLate = differenceInDays(new Date(), new Date(item.dueDate));
                
                return (
                  <tr key={item._id} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-black text-slate-900">{item.user?.fullName || 'Unknown Student'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{item.book?.title || 'Unknown Book'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-900">{format(new Date(item.dueDate), 'MMM dd, yyyy')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-600">
                        <AlertTriangle size={10} />
                        {daysLate} Days
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleSendReminder(item.user?.fullName)}
                        className="bg-white border text-xs border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 ml-auto active:scale-95"
                      >
                        <Send size={14} />
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {overdueList.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Clock size={32} />
                    </div>
                    <p className="text-slate-900 font-bold mb-1">No Overdue Books</p>
                    <p className="text-slate-500 text-sm">All issued books have been returned on time!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
