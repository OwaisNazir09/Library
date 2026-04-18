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
import { X, Search as SearchIcon, UserPlus, CheckCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const AttendanceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

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
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-bold text-xs"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-teal-900/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            Manual Check-in
          </button>
          <button
            className="bg-white border border-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all"
          >
            <Download size={18} />
            Export CSV
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

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by student name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl w-full outline-none font-bold text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing:</span>
            <span className="bg-[#044343]/10 text-[#044343] px-3 py-1 rounded-lg text-[10px] font-black">
              {filteredRecords.length} Records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in Time</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
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
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-900">
                          {format(parseISO(record.checkIn), 'hh:mm a')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-600">
                        {format(parseISO(record.checkIn), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {record.method || 'QR Scan'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500 italic">
                        {record.note || '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={10} />
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
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

export default AttendanceList;
