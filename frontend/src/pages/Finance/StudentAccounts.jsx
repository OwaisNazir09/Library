import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAccountsQuery,
  useGetStudentAccountsQuery,
  useGetFinanceStatsQuery
} from '../../store/api/financeApi';
import {
  Search, TrendingUp, TrendingDown, Landmark, Users,
  ChevronRight, BarChart3, CircleDollarSign, CreditCard,
  Building2, UserCircle
} from 'lucide-react';
import FinanceHeader from './FinanceHeader';
import UniversalTransactionModal from './UniversalTransactionModal';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const TYPE_ORDER = ['Assets', 'Liabilities', 'Income', 'Expenses', 'Equity'];

const AllAccounts = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [modal, setModal] = useState({ type: null, isOpen: false });
  const studentLimit = 15;

  const { data: statsData } = useGetFinanceStatsQuery();
  const { data: accountsData, isLoading: acLoading } = useGetAccountsQuery(
    typeFilter ? { type: typeFilter } : {}
  );
  const { data: studentData, isLoading: stLoading } = useGetStudentAccountsQuery({
    page: studentPage,
    limit: studentLimit,
    search: typeFilter === '' || typeFilter === 'Assets' ? search : '__none__'
  });

  const stats = statsData?.data || {};
  const allAccounts = (accountsData?.data || []).filter(
    a => a.subType !== 'Student Receivable'
  );
  const students = studentData?.data || [];
  const totalStudents = studentData?.total || 0;

  const fmt = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

  // Group system accounts by type
  const filtered = allAccounts.filter(a =>
    !search ||
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.subType?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, a) => {
    const t = a.type || 'Other';
    if (!acc[t]) acc[t] = [];
    acc[t].push(a);
    return acc;
  }, {});

  const summaryCards = [
    { label: 'Total Assets', value: fmt(stats.totalAssets), icon: Landmark },
    { label: 'Total Income', value: fmt(stats.totalIncome), icon: TrendingUp },
    { label: 'Total Expenses', value: fmt(stats.totalExpenses), icon: TrendingDown },
    { label: 'Pending Dues', value: fmt(stats.pendingFees), icon: Users },
    { label: 'Liquid Assets', value: fmt(stats.liquidAssets), icon: CircleDollarSign },
    { label: 'Net Profit', value: fmt(stats.netProfit), icon: BarChart3 },
  ];

  const showStudents = !typeFilter || typeFilter === 'Assets';

  return (
    <div className="space-y-5 pb-10">
      <FinanceHeader onAction={(t) => setModal({ type: t, isOpen: true })} />

      <UniversalTransactionModal
        initialType={modal.type || 'journal'}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
      />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">All Accounts</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Complete chart of accounts — system &amp; members
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setStudentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl h-[42px] pl-10 pr-4 text-[14px] outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Type Filter - Scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {['', ...TYPE_ORDER].map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setStudentPage(1); }}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all border shrink-0 ${typeFilter === t
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {t || 'All Accounts'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map((card, i) => (
          <div key={i} className="card py-4 px-4 flex flex-col items-center text-center gap-2 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
              <card.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{card.label}</p>
              <p className="text-[16px] font-black text-slate-900 leading-tight mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Student Member Accounts ── */}
      {showStudents && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
              <UserCircle size={16} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900">Student Receivables</p>
              <p className="text-[11px] text-slate-400 font-medium">{totalStudents} member{totalStudents !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block table-container">
            <table className="table-main">
              <thead>
                <tr>
                  <th className="px-5">Member</th>
                  <th className="text-center">Account No</th>
                  <th className="text-right">Total Paid</th>
                  <th className="text-right">Last Payment</th>
                  <th className="text-right">Balance</th>
                  <th className="text-right px-5">Status</th>
                  <th className="px-5"></th>
                </tr>
              </thead>
              <tbody>
                {stLoading ? (
                  <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-xs animate-pulse">Loading members...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-xs italic">No members found matching your search.</td></tr>
                ) : students.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[12px] overflow-hidden shrink-0 shadow-sm">
                          {s.studentId?.profilePicture
                            ? <img src={s.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                            : (s.studentId?.fullName || 'M').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 truncate leading-none">
                            {s.studentId?.fullName || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1">
                            ID: {s.studentId?.idNumber || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-[12px] font-mono text-slate-500">{s.accountNumber || '—'}</td>
                    <td className="text-right font-bold text-[14px] text-slate-900">{fmt(s.totalPaid)}</td>
                    <td className="text-right text-[12px] text-slate-500 font-medium">
                      {s.lastPaymentDate ? format(new Date(s.lastPaymentDate), 'dd MMM yy') : '—'}
                    </td>
                    <td className="text-right">
                      <span className={`text-[14px] font-bold ${s.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {fmt(s.currentBalance)}
                      </span>
                    </td>
                    <td className="text-right px-5">
                      <span className={`badge lowercase ${s.currentBalance > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {s.currentBalance > 0 ? 'Due' : 'Clear'}
                      </span>
                    </td>
                    <td className="px-5 text-right">
                      <button
                        onClick={() => navigate(`/app/finance/student-accounts/${s.studentId?._id || s._id}`)}
                        className="btn btn-secondary btn-sm h-8 px-3 text-[11px] font-bold"
                      >
                        Ledger <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {stLoading ? (
              <div className="p-10 text-center text-slate-400 text-xs animate-pulse">Loading members...</div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs italic">No members found.</div>
            ) : students.map(s => (
              <div key={s._id} className="card p-4 space-y-4" onClick={() => navigate(`/app/finance/student-accounts/${s.studentId?._id || s._id}`)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[14px] overflow-hidden shrink-0 shadow-sm">
                      {s.studentId?.profilePicture
                        ? <img src={s.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                        : (s.studentId?.fullName || 'M').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-slate-900 truncate leading-none">
                        {s.studentId?.fullName || 'Unknown'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">
                        ID: {s.studentId?.idNumber || '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`badge badge-sm lowercase ${s.currentBalance > 0 ? 'badge-danger' : 'badge-success'}`}>
                    {s.currentBalance > 0 ? 'Due' : 'Clear'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Balance Due</p>
                    <p className={`text-[16px] font-black ${s.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmt(s.currentBalance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
                    <p className="text-[16px] font-bold text-slate-900">{fmt(s.totalPaid)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Payment</p>
                    <p className="text-[12px] font-bold text-slate-700">
                      {s.lastPaymentDate ? format(new Date(s.lastPaymentDate), 'dd MMM yyyy') : 'Never'}
                    </p>
                  </div>
                  <button className="text-slate-900 font-bold text-[12px] flex items-center gap-1">
                    View Ledger <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalStudents > studentLimit && (
            <div className="px-1 py-3 flex justify-between items-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Page {studentPage}</p>
              <Pagination total={totalStudents} limit={studentLimit} currentPage={studentPage} onPageChange={setStudentPage} />
            </div>
          )}
        </div>
      )}

      {/* ── System Accounts Grouped by Type ── */}
      {TYPE_ORDER.filter(t => t !== 'Assets' || typeFilter).map(type => {
        if (typeFilter && typeFilter !== type) return null;
        const accounts = grouped[type];
        if (!accounts || accounts.length === 0) return null;
        const typeTotal = accounts.reduce((s, a) => s + (a.currentBalance || 0), 0);

        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">{type}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total {type}</p>
                <p className="text-[18px] font-black text-slate-900 mt-0.5">{fmt(typeTotal)}</p>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block table-container">
              <table className="table-main">
                <thead>
                  <tr>
                    <th className="px-5">Account Name</th>
                    <th>Sub-Type</th>
                    <th className="text-right">Balance</th>
                    <th className="px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a._id} className="hover:bg-slate-50/50">
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 text-[12px] font-black shadow-sm">
                            {a.name?.charAt(0)}
                          </div>
                          <p className="text-[14px] font-bold text-slate-800">{a.name}</p>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral lowercase text-[10px] font-bold">{a.subType || type}</span>
                      </td>
                      <td className="text-right font-black text-[14px] text-slate-900">
                        {fmt(a.currentBalance)}
                      </td>
                      <td className="px-5 text-right">
                        <button
                          onClick={() => navigate(`/app/finance/student-accounts/${a._id}`)}
                          className="btn btn-secondary btn-sm h-8 px-3 text-[11px] font-bold"
                        >
                          Ledger <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for System Accounts */}
            <div className="md:hidden space-y-3">
              {accounts.map(a => (
                <div key={a._id} className="card p-4 flex items-center justify-between" onClick={() => navigate(`/app/finance/student-accounts/${a._id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 text-[14px] font-black shadow-sm">
                      {a.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-slate-900 truncate leading-none">{a.name}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{a.subType || type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-black text-slate-900">{fmt(a.currentBalance)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Balance</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllAccounts;
