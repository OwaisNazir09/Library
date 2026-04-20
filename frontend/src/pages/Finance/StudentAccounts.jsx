import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAccountsQuery, useGetFinanceStatsQuery } from '../../store/api/financeApi';
import { Search, Users, ArrowRight, Wallet, TrendingUp, Download, Filter, ChevronLeft, ChevronRight, AlertCircle, User } from 'lucide-react';
import FinanceHeader from './FinanceHeader';
import UniversalTransactionModal from './UniversalTransactionModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const StudentAccounts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ type: null, isOpen: false });
  const limit = 10;

  const { data: stats } = useGetFinanceStatsQuery();
  const { data: accountsData, isLoading: loading } = useGetAccountsQuery({ 
    page: currentPage, 
    limit, 
    search: searchTerm,
    subType: 'Student Receivable'
  });

  const accounts = accountsData?.data || [];
  const totalAccounts = accountsData?.total || 0;

  const handleAction = (type) => setModal({ type, isOpen: true });

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const statCards = [
    { label: 'Pending Dues', value: fmt(stats?.data?.pendingFees), color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertCircle },
    { label: 'Due Students', value: stats?.data?.dueCount || 0, color: 'text-amber-500', bg: 'bg-amber-50', icon: Users },
    { label: 'Total Accounts', value: totalAccounts, color: 'text-[#044343]', bg: 'bg-teal-50', icon: User },
    { label: 'Total Paid', value: fmt(stats?.data?.totalIncome), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wallet },
  ];

  return (
    <div className="space-y-5 pb-10">
      <FinanceHeader onAction={handleAction} />

      <UniversalTransactionModal 
        initialType={modal.type || 'journal'} 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ type: null, isOpen: false })} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Ledgers</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage individual member balances and accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card py-3.5 px-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Student / ID</th>
              <th className="text-center">Account No</th>
              <th className="text-center">Total Paid</th>
              <th className="text-center">Last Payment</th>
              <th className="text-center">Balance</th>
              <th className="text-center">Status</th>
              <th className="text-right px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && accounts.length === 0 ? (
              <tr><td colSpan="7" className="p-8"><LoadingSkeleton type="table" rows={10} /></td></tr>
            ) : (
              accounts.map((account) => (
                <tr key={account._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-teal-50 flex items-center justify-center text-[#044343] font-bold text-[11px] border border-teal-100 overflow-hidden">
                        {account.studentId?.profilePicture ? (
                           <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : account.studentId?.fullName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{account.studentId?.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">ID: {account.studentId?.idNumber || account._id.substring(18)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center text-[11px] font-medium text-slate-500 uppercase tracking-tighter">
                    {account.accountNumber}
                  </td>
                  <td className="text-center font-bold text-emerald-600 text-[13px]">
                    {fmt(account.totalPaid)}
                  </td>
                  <td className="text-center text-[12px] font-medium text-slate-500">
                    {account.lastPaymentDate ? format(new Date(account.lastPaymentDate), 'dd MMM yy') : '—'}
                  </td>
                  <td className="text-center">
                    <span className={`text-[13px] font-bold ${account.currentBalance > 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                      {fmt(account.currentBalance)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${account.status === 'clear' ? 'badge-success' : account.status === 'overdue' ? 'badge-danger' : 'badge-warning'} lowercase`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-5 text-right">
                    <button onClick={() => navigate(`/app/finance/student-accounts/${account.studentId?._id}`)} className="btn btn-secondary btn-sm px-4">
                      View Ledger
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!loading && accounts.length === 0 && (
              <tr><td colSpan="7" className="p-20 text-center text-slate-400 text-xs italic">No student accounts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {accounts.length} records</p>
        <Pagination total={totalAccounts} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default StudentAccounts;
