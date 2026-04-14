import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetAccountsQuery, 
  useGetFinanceStatsQuery 
} from '../../store/api/financeApi';
import { 
  Search, Users, ArrowRight, Wallet, TrendingUp, 
  Download, Filter, ChevronLeft, ChevronRight, AlertCircle, User
} from 'lucide-react';
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

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const statCards = [
    { label: 'Total Pending', value: fmt(stats?.data?.pendingFees), color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertCircle },
    { label: 'Due Students', value: stats?.data?.dueCount || 0, color: 'text-amber-500', bg: 'bg-amber-50', icon: Users },
    { label: 'Overdue Students', value: stats?.data?.overdueCount || 0, color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle },
    { label: 'Total Accounts', value: totalAccounts, color: 'text-[#044343]', bg: 'bg-teal-50', icon: User },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <FinanceHeader onAction={handleAction} />

      <UniversalTransactionModal 
        initialType={modal.type || 'journal'} 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ type: null, isOpen: false })} 
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Student Ledgers</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Manage individual student balances</p>
        </div>
        <div className="relative w-full lg:w-96 mx-auto lg:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder="Search student or ACC..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4 transition-all duration-300">
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{stat.label}</p>
              <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[900px] lg:min-w-0">
            <thead className="bg-slate-50/50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-6 md:px-8 py-5">Student / ID</th>
                <th className="px-4 md:px-6 py-5 text-center">Account No</th>
                <th className="px-4 md:px-6 py-5 text-center">Total Paid</th>
                <th className="px-4 md:px-6 py-5 text-center">Last Payment</th>
                <th className="px-4 md:px-6 py-5 text-center">Balance</th>
                <th className="px-4 md:px-6 py-5 text-center">Status</th>
                <th className="px-6 md:px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && accounts.length === 0 ? (
                <tr>
                   <td colSpan="7" className="p-8">
                      <LoadingSkeleton type="table" rows={5} />
                   </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 md:px-8 py-4 md:py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden font-black uppercase text-xs">
                          {account.studentId?.profilePicture ? (
                             <img src={account.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            account.studentId?.fullName?.charAt(0) || <User size={16} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs md:text-sm font-black text-slate-900 leading-tight truncate max-w-[120px]">{account.studentId?.fullName || 'Unknown'}</span>
                          <span className="text-[9px] md:text-[10px] text-slate-400 font-bold tracking-widest truncate">{account.studentId?.idNumber || 'No ID'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-center text-[10px] md:text-xs font-bold text-slate-500 lowercase tracking-widest">
                      {account.accountNumber}
                    </td>
                     <td className="px-4 md:px-6 py-4 md:py-5 text-center text-xs font-bold text-emerald-500 whitespace-nowrap">
                      {fmt(account.totalPaid)}
                    </td>
                     <td className="px-4 md:px-6 py-4 md:py-5 text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {account.lastPaymentDate ? format(new Date(account.lastPaymentDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-center">
                       <span className={`text-xs md:text-sm font-black tracking-tight ${account.currentBalance > 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                         {fmt(account.currentBalance)}
                       </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                        account.status === 'clear' ? 'bg-emerald-100 text-emerald-600' : 
                        account.status === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-5 text-right">
                      <button 
                        onClick={() => navigate(`/app/finance/student-accounts/${account.studentId._id}`)}
                        className="bg-[#044343] text-white px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#033636] transition-all flex items-center gap-2 ml-auto"
                      >
                        Ledger <ArrowRight size={12} className="hidden md:block" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalAccounts > 0 && (
          <div className="mt-auto border-t border-slate-50">
            <Pagination 
              total={totalAccounts}
              limit={limit}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAccounts;
