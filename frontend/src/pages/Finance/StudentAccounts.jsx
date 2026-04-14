import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, IndianRupee, Users, ArrowRight, User, AlertCircle } from 'lucide-react';
import { useGetStudentAccountsQuery, useGetFinanceStatsQuery } from '../../store/api/financeApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';

const StudentAccounts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const { data: stats } = useGetFinanceStatsQuery();
  const { data: accountsData, isLoading: loading } = useGetStudentAccountsQuery({ 
    page: currentPage, 
    limit, 
    search: searchTerm 
  });

  const accounts = accountsData?.data || [];
  const totalAccounts = accountsData?.total || 0;

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const statCards = [
    { label: 'Total Pending', value: fmt(stats?.pendingFees), color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertCircle },
    { label: 'Due Students', value: stats?.dueCount || 0, color: 'text-amber-500', bg: 'bg-amber-50', icon: Users },
    { label: 'Overdue Students', value: stats?.overdueCount || 0, color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle },
    { label: 'Total Accounts', value: totalAccounts, color: 'text-[#044343]', bg: 'bg-teal-50', icon: User },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Accounts</h1>
          <p className="text-slate-500 font-medium italic">Manage individual student ledgers and balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name or ID..."
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
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
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
                <th className="px-6 py-5 text-center">Account No</th>
                <th className="px-6 py-5 text-center">Total Paid</th>
                <th className="px-6 py-5 text-center">Last Payment</th>
                <th className="px-6 py-5 text-center">Balance</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && accounts.length === 0 ? (
                <tr>
                   <td colSpan="7" className="p-8">
                      <LoadingSkeleton type="table" rows={5} />
                   </td>
                </tr>
              ) : accounts.map((account) => (
                <tr key={account._id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden font-black uppercase">
                        {account.studentId?.profilePicture ? (
                           <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          account.studentId?.fullName?.charAt(0) || <User size={18} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 leading-tight">{account.studentId?.fullName || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest">{account.studentId?.idNumber || 'No ID'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">
                    {account.accountNumber}
                  </td>
                   <td className="px-6 py-5 text-center text-xs font-bold text-emerald-500">
                    {fmt(account.totalPaid)}
                  </td>
                   <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">
                    {account.lastPaymentDate ? new Date(account.lastPaymentDate).toLocaleDateString() : 'No payment'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1 font-black text-slate-900">
                       <span className={`text-sm tracking-tight ${account.currentBalance > 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                         {fmt(account.currentBalance)}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      account.status === 'clear' ? 'bg-emerald-100 text-emerald-600' : 
                      account.status === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => navigate(`/app/finance/accounts/${account.studentId._id}`)}
                      className="bg-[#044343] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#033636] transition-all flex items-center gap-2 ml-auto"
                    >
                      View Ledger <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {!loading && accounts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Users size={32} />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight text-lg">No Student Accounts Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalAccounts > 0 && (
          <Pagination 
            total={totalAccounts}
            limit={limit}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentAccounts;
