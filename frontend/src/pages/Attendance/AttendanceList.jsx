import React, { useState } from 'react';
import { 
  Calendar, Search, ChevronRight, Clock, User, Filter, 
  Download, CheckCircle2, XCircle, X, Search as SearchIcon, 
  UserPlus, CheckCircle, Loader2, QrCode as QrIcon 
} from 'lucide-react';
import { useGetAllAttendanceQuery, useMarkAttendanceMutation } from '../../store/api/attendanceApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import QRCode from 'react-qr-code';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
      <Icon size={18} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <h3 className="text-lg font-bold text-slate-900 leading-none mt-0.5">{value}</h3>
    </div>
  </div>
);

const AttendanceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
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

  const handleManualEntry = async () => {
    if (!selectedStudent) return;
    const isStudentCheckedIn = attendanceRecords.some(r => r.userId?._id === selectedStudent._id && !r.checkOut);
    try {
      await markAttendance({ userId: selectedStudent._id }).unwrap();
      toast.success(isStudentCheckedIn ? `Check-out recorded` : `Check-in recorded`);
      setIsModalOpen(false);
      setSelectedStudent(null);
      setUserSearchText('');
    } catch (err) {}
  };

  const filteredRecords = attendanceRecords.filter(record => 
    record.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance Tracking</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage daily member entries and exits</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-36 h-[34px] px-2 text-[12px] font-bold"
          />
          <button onClick={() => setShowQRModal(true)} className="btn btn-secondary btn-md text-amber-600 bg-amber-50">
            <QrIcon size={14} /> <span className="hidden lg:inline">QR Code</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-md">
            <UserPlus size={16} /> <span className="hidden lg:inline">Manual Log</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Present Now" value={presentNow} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={Clock} label="Total Entries" value={attendanceRecords.length} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={XCircle} label="Checked Out" value={checkedOutToday} color="text-rose-500" bg="bg-rose-50" />
        <div className="card flex items-center justify-between py-2">
           <div className="min-w-0">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</p>
             <h3 className="text-[13px] font-bold text-slate-900">Reports</h3>
           </div>
           <button className="btn btn-ghost btn-sm w-8 h-8 p-0"><Download size={16} /></button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Filter student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48 bg-slate-50 border-none rounded h-8 pl-8 pr-2 text-[12px] outline-none" />
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-md">
                 <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>List</button>
                 <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Calendar</button>
              </div>
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase">{filteredRecords.length} Records</span>
        </div>

        {viewMode === 'calendar' ? (
          <div className="p-5">
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-400 uppercase">{day}</div>
              ))}
              {[...Array(35)].map((_, i) => {
                const day = i - 2;
                const isToday = day === new Date().getDate();
                return (
                  <div key={i} className="bg-white min-h-[80px] p-2 hover:bg-slate-50 transition-colors cursor-pointer border-r border-b border-slate-100">
                    <span className={`text-[11px] font-bold ${isToday ? 'bg-teal-600 text-white w-5 h-5 rounded flex items-center justify-center' : 'text-slate-300'}`}>{day > 0 && day <= 30 ? day : ''}</span>
                    {day === new Date().getDate() && attendanceRecords.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">+{attendanceRecords.length} Present</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-main">
              <thead>
                <tr>
                  <th className="px-5">Student</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duration</th>
                  <th>Method</th>
                  <th className="px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && attendanceRecords.length === 0 ? (
                  <tr><td colSpan="6" className="p-8"><LoadingSkeleton type="table" rows={10} /></td></tr>
                ) : filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-teal-50 flex items-center justify-center text-[#044343] font-bold text-[10px] border border-teal-100">
                          {record.userId?.fullName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{record.userId?.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{record.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[12px] font-semibold text-slate-700">{format(parseISO(record.checkIn), 'hh:mm a')}</td>
                    <td className="text-[12px] font-semibold text-slate-700">
                      {record.checkOut ? format(parseISO(record.checkOut), 'hh:mm a') : <span className="text-emerald-500">Active</span>}
                    </td>
                    <td><span className="badge badge-neutral lowercase">{calculateDuration(record.checkIn, record.checkOut)}</span></td>
                    <td className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter">{record.method || 'QR Scan'}</td>
                    <td className="px-5 text-right">
                      <span className={`badge ${record.checkOut ? 'badge-neutral' : 'badge-success'} lowercase`}>
                        {record.checkOut ? 'Exited' : 'Present'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {filteredRecords.length} records</p>
        <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-sm">
              <div className="modal-h"><h2 className="text-sm font-bold">Manual Attendance Entry</h2><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button></div>
              <div className="modal-b space-y-4">
                <div className="space-y-1.5">
                  <label className="label">Search Student</label>
                  <div className="relative">
                    <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Name or email..." value={userSearchText} onChange={(e) => setUserSearchText(e.target.value)} className="input pl-8" />
                  </div>
                  {userSearchText.length >= 2 && students.length > 0 && !selectedStudent && (
                    <div className="mt-1 bg-white border border-slate-100 rounded-lg shadow-lg divide-y divide-slate-50 overflow-hidden">
                      {students.map(s => (
                        <button key={s._id} onClick={() => { setSelectedStudent(s); setUserSearchText(s.fullName); }} className="w-full p-2.5 text-left hover:bg-slate-50 text-[12px] font-semibold">{s.fullName} ({s.email})</button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedStudent && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                     <div className="min-w-0"><p className="text-[12px] font-bold text-slate-900 truncate">{selectedStudent.fullName}</p></div>
                     <button onClick={() => setSelectedStudent(null)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><X size={14} /></button>
                  </div>
                )}
              </div>
              <div className="modal-f">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md px-4">Cancel</button>
                <button onClick={handleManualEntry} disabled={!selectedStudent || isMarking} className="btn btn-primary btn-md px-6">
                  {isMarking ? <Loader2 size={14} className="animate-spin" /> : 'Record Log'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-sm">
               <div className="modal-h"><h2 className="text-sm font-bold">Entry QR Code</h2><button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button></div>
               <div className="modal-b flex flex-col items-center py-6">
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                    <QRCode value={tenantId || 'no-tenant'} size={180} />
                 </div>
                 <p className="text-xs text-slate-500 text-center px-6">Scan using the Library App to mark attendance instantly.</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceList;
