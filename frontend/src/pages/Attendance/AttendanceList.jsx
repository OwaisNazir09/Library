import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  ChevronRight, 
  Clock, 
  User, 
  Filter,
  Download,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useGetAllAttendanceQuery, useMarkAttendanceMutation } from '../../store/api/attendanceApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, UserPlus, CheckCircle, Loader2, QrCode as QrIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import QRCode from 'react-qr-code';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const AttendanceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const limit = 20;
  
  const tenantId = useSelector(state => state.auth.tenantId);
  const [showQRModal, setShowQRModal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearchText, setUserSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, isLoading, error, refetch } = useGetAllAttendanceQuery({
    date: selectedDate,
    page: currentPage,
    limit
  });

  const { data: studentsData } = useGetUsersQuery({ 
    search: userSearchText, 
    role: 'member',
    limit: 5
  }, { skip: userSearchText.length < 2 });

  const [markAttendance, { isLoading: isMarking }] = useMarkAttendanceMutation();

  const students = studentsData?.data?.users || [];

  const attendanceRecords = data?.data?.attendance || [];
  const total = data?.total || attendanceRecords.length;

  const presentNow = attendanceRecords.filter(r => !r.checkOut).length;
  const checkedOutToday = attendanceRecords.filter(r => !!r.checkOut).length;

  const calculateDuration = (inTime, outTime) => {
    if (!outTime) return '—';
    const duration = new Date(outTime) - new Date(inTime);
    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRecords = attendanceRecords.filter(record => 
    record.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualCheckIn = async () => {
    if (!selectedStudent) return;
    try {
      await markAttendance({ userId: selectedStudent._id }).unwrap();
      toast.success(`Check-in recorded for ${selectedStudent.fullName}`);
      setIsModalOpen(false);
      setSelectedStudent(null);
      setUserSearchText('');
    } catch (err) {
      // Error handled by global handler
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Library Management</span>
            <ChevronRight size={10} />
            <span className="text-[#044343]">Attendance Logs</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Tracking</h1>
          <p className="text-slate-500 font-medium">Monitor student check-ins and library usage patterns.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-hover:text-[#044343] transition-colors">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#044343]/5 focus:border-[#044343] outline-none font-black text-xs transition-all cursor-pointer"
            />
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="bg-amber-500 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest px-8"
          >
            <QrIcon size={18} />
            Show Entry QR
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#044343] text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-teal-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            <UserPlus size={18} />
            Manual Check-in
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" size={24} />} 
          label="Present Now" 
          value={presentNow} 
          color="emerald" 
        />
        <StatCard 
          icon={<Clock className="text-blue-600" size={24} />} 
          label="Total Today" 
          value={attendanceRecords.length} 
          color="blue" 
        />
        <StatCard 
          icon={<Download className="text-amber-600" size={24} />} 
          label="Checked Out" 
          value={checkedOutToday} 
          color="amber" 
        />
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Export Data</p>
            <h3 className="text-lg font-black text-slate-900">Reports</h3>
          </div>
          <button className="bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl transition-all">
            <Download size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-xl">
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-[#044343] mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Check-in</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Search and record student arrival.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Name or email..."
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#044343]/10"
                    />
                  </div>
                  
                  {userSearchText.length >= 2 && students.length > 0 && !selectedStudent && (
                    <div className="mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-50">
                      {students.map(student => (
                        <button
                          key={student._id}
                          onClick={() => { setSelectedStudent(student); setUserSearchText(student.fullName); }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#044343] flex items-center justify-center text-white font-black text-xs">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{student.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{student.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedStudent && (
                  <div className="bg-[#044343]/5 p-4 rounded-2xl border border-[#044343]/10 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#044343] flex items-center justify-center text-white font-black">
                        {selectedStudent.fullName.charAt(0)}
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-black text-slate-900">{selectedStudent.fullName}</p>
                        <p className="text-xs font-bold text-slate-500">{selectedStudent.email}</p>
                     </div>
                     <button onClick={() => setSelectedStudent(null)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                        <X size={16} />
                     </button>
                  </div>
                )}

                <button
                  onClick={handleManualCheckIn}
                  disabled={!selectedStudent || isMarking}
                  className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMarking ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Presence'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[3rem] p-12 shadow-2xl relative text-center">
               <button onClick={() => setShowQRModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-xl">
                <X size={20} />
              </button>

              <div className="mb-8">
                <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-600 mx-auto mb-6">
                  <QrIcon size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Entry QR Code</h2>
                <p className="text-sm font-medium text-slate-500 mt-2 px-4">Students can scan this code using the mobile app to mark their attendance.</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-50 shadow-inner inline-block mx-auto mb-8">
                <QRCode 
                  value={tenantId || 'no-tenant'} 
                  size={200}
                  level="H"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 py-3 rounded-2xl border border-emerald-100">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Attendance Active
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Scanning works for both <br/> check-in and check-out
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4 flex-1">
             <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Filter by student name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl w-full outline-none font-bold text-xs"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-[#044343] shadow-sm' : 'text-slate-400'}`}
               >
                 List
               </button>
               <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-[#044343] shadow-sm' : 'text-slate-400'}`}
               >
                 Calendar
               </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate:</span>
            <span className="bg-[#044343]/10 text-[#044343] px-3 py-1 rounded-lg text-[10px] font-black text-center min-w-[80px]">
              {filteredRecords.length} Today
            </span>
          </div>
        </div>

        {viewMode === 'calendar' ? (
           <div className="p-8 group">
              <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-inner">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                   <div key={day} className="bg-slate-50 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {day}
                   </div>
                 ))}
                 {[...Array(35)].map((_, i) => {
                    const day = i - 2; // Placeholder logic for current month
                    const isToday = day === new Date().getDate();
                    return (
                      <div key={i} className="bg-white min-h-[140px] p-4 group/day hover:bg-slate-50 transition-colors cursor-pointer">
                         <div className="flex justify-between items-start">
                            <span className={`text-xs font-black ${isToday ? 'bg-[#044343] text-white w-6 h-6 rounded-lg flex items-center justify-center' : 'text-slate-300'}`}>
                               {day > 0 && day <= 30 ? day : ''}
                            </span>
                            {day > 0 && day <= 30 && (
                              <div className="flex flex-col items-end gap-1">
                                 <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                    +{Math.floor(Math.random() * 20)} In
                                 </span>
                                 <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                    {Math.floor(Math.random() * 5)} Left
                                 </span>
                              </div>
                            )}
                         </div>
                         {day === new Date().getDate() && (
                            <div className="mt-4 space-y-2">
                               {attendanceRecords.slice(0, 3).map(r => (
                                 <div key={r._id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-bold text-slate-600 truncate">{r.userId?.fullName}</span>
                                 </div>
                               ))}
                               {attendanceRecords.length > 3 && (
                                 <p className="text-[8px] font-black text-[#044343] text-center uppercase tracking-widest">
                                    + {attendanceRecords.length - 3} more
                                 </p>
                               )}
                            </div>
                         )}
                      </div>
                    );
                 })}
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> High Attendance</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> Active Now</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm" /> Holiday</div>
              </div>
           </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Student</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Check-in</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Check-out</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Duration</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left text-left">Method</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8">
                    <LoadingSkeleton type="table" rows={10} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-12">
                    <ErrorState message="Failed to load attendance records" onRetry={refetch} />
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12">
                     <EmptyState 
                      title="No records found" 
                      message="No attendance records found for the selected date."
                      icon={Clock}
                    />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#044343] font-black">
                          {record.userId?.fullName?.charAt(0) || <User size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">
                            {record.userId?.fullName || 'Unknown User'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">
                            {record.userId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-emerald-500" />
                        <span className="text-xs font-black text-slate-900">
                          {format(parseISO(record.checkIn), 'hh:mm a')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={record.checkOut ? "text-amber-500" : "text-slate-300"} />
                        <span className={`text-xs font-black ${record.checkOut ? "text-slate-900" : "text-slate-400 italic"}`}>
                          {record.checkOut ? format(parseISO(record.checkOut), 'hh:mm a') : 'Inside'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-slate-700 bg-slate-100/50 px-3 py-1 rounded-lg border border-slate-100">
                        {calculateDuration(record.checkIn, record.checkOut)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {record.method || 'QR Scan'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {record.checkOut ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                          <XCircle size={10} />
                          Exited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 animate-pulse">
                          <CheckCircle2 size={10} />
                          Present
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
        
        {total > limit && (
          <div className="p-6 border-t border-slate-50">
            <Pagination 
              total={total}
              limit={limit}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-5 bg-white ${colors[color].split(' ')[2]}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color].split(' ').slice(0, 2).join(' ')}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default AttendanceList;
