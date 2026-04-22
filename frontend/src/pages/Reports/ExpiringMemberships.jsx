import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, AlertTriangle, ArrowLeft, Mail, Bell, Search, History, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getExpiringMemberships } from '../../services/reportService';

const ExpiringMemberships = () => {
  const [data, setData] = useState({ upcoming: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getExpiringMemberships();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch expiring memberships", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentMembers = activeTab === 'upcoming' ? data.upcoming : data.recent;

  const filteredMembers = currentMembers.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm)
  );

  const getDaysDiff = (date) => {
    const diffTime = new Date(date) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Membership Expiry Report</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Track upcoming and recently expired membership packages</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { id: 'upcoming', label: 'Upcoming Expiry', icon: Clock, color: 'text-indigo-600' },
            { id: 'recent', label: 'Recently Expired', icon: History, color: 'text-rose-600' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? tab.color : ''} />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-slate-100 text-slate-600' : 'bg-slate-200/50 text-slate-400'
              }`}>
                {tab.id === 'upcoming' ? data.upcoming.length : data.recent.length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search member..."
            className="input pl-9 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Package</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  {activeTab === 'upcoming' ? 'Days Left' : 'Days Ago'}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="wait">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member, i) => {
                      const daysDiff = getDaysDiff(member.packageEndDate);
                      return (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: i * 0.03 }}
                          key={member._id} 
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase ${
                                activeTab === 'upcoming' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {member.fullName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 leading-none">{member.fullName}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                              {member.package?.name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={13} className="text-slate-400" />
                              <span className="text-xs font-medium">{new Date(member.packageEndDate).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[11px] font-bold ${
                              activeTab === 'upcoming' 
                              ? (daysDiff <= 3 ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md' : 'text-slate-600')
                              : 'text-rose-400'
                            }`}>
                              {Math.abs(daysDiff)} days
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               {activeTab === 'upcoming' && daysDiff <= 3 && (
                                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-500 uppercase tracking-tight bg-rose-50 px-2 py-1 rounded-lg">
                                   <Bell size={10} />
                                   Due
                                 </div>
                               )}
                               <span className={`badge ${member.subscriptionStatus === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                {member.subscriptionStatus}
                               </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-300 gap-3">
                          <Users size={40} className="opacity-20" />
                          <p className="text-[11px] font-bold uppercase tracking-widest">No members found</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpiringMemberships;
