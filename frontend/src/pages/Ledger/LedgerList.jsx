import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, IndianRupee, BookMarked, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchLedgers, fetchLedgerStats } from '../../store/slices/ledgerSlice';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';

const LedgerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ledgers, totalLedgers, loading, stats } = useSelector((state) => state.ledger);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const fetchData = useCallback(() => {
    dispatch(fetchLedgerStats());
    dispatch(fetchLedgers({ page: currentPage, limit, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const statCards = [
    { label: 'Total Collected', value: stats?.totalCollected || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Pending', value: stats?.totalPending || 0, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: "Today's Collection", value: stats?.todayCollection || 0, color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: 'Overdue Students', value: stats?.overdueCount || 0, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Ledger</h1>
          <p className="text-slate-500 font-medium italic">Manage student accounts, fees, and payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Student / ID</th>
                <th className="px-6 py-5 text-center">Ledger ID</th>
                <th className="px-6 py-5 text-center">Total Fee</th>
                <th className="px-6 py-5 text-center">Total Paid</th>
                <th className="px-6 py-5 text-center">Balance</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && ledgers.length === 0 ? (
                <tr>
                   <td colSpan="7" className="p-8">
                      <LoadingSkeleton type="table" rows={5} />
                   </td>
                </tr>
              ) : ledgers.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden font-black">
                        {item.studentId?.fullName?.charAt(0) || <User size={18} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 leading-tight">{item.studentId?.fullName || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest">{item.studentId?.idNumber || 'No ID'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">
                    {item.ledgerId}
                  </td>
                   <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">
                    ₹{item.totalFee}
                  </td>
                   <td className="px-6 py-5 text-center text-xs font-bold text-emerald-500">
                    ₹{item.totalPaid}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 font-black text-slate-900">
                       <span className={`text-sm tracking-tight ${item.balance > 0 ? 'text-rose-500' : 'text-slate-900'}`}>₹{item.balance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'clear' ? 'bg-emerald-100 text-emerald-600' : 
                      item.status === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => navigate(`/app/ledger/${item.studentId._id}`)}
                      className="bg-[#044343] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#033636] transition-all"
                    >
                      View Ledger
                    </button>
                  </td>
                </tr>
              ))}
              
              {!loading && ledgers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <BookMarked size={32} />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight text-lg">No Ledgers Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalLedgers > 0 && (
          <Pagination 
            total={totalLedgers}
            limit={limit}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default LedgerList;
