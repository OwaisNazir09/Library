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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">All Accounts</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Complete chart of accounts — system &amp; members
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {['', ...TYPE_ORDER].map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setStudentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${typeFilter === t
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {t || 'All'}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search accounts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-44 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {summaryCards.map((card, i) => (
          <div key={i} className="card py-3 px-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
              <card.icon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{card.label}</p>
              <p className="text-[15px] font-bold text-slate-900 leading-tight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Student Member Accounts ── */}
      {showStudents && (
        <div className="table-container">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <UserCircle size={14} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Student Receivables</p>
                <p className="text-[10px] text-slate-400 font-medium">{totalStudents} member{totalStudents !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

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
                <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-xs italic">No members found.</td></tr>
              ) : students.map(s => (
                <tr key={s._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[11px] overflow-hidden shrink-0">
                        {s.studentId?.profilePicture
                          ? <img src={s.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                          : (s.studentId?.fullName || 'M').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate leading-none">
                          {s.studentId?.fullName || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          ID: {s.studentId?.idNumber || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center text-[11px] font-mono text-slate-500">{s.accountNumber || '—'}</td>
                  <td className="text-right font-bold text-[13px] text-slate-900">{fmt(s.totalPaid)}</td>
                  <td className="text-right text-[12px] text-slate-500">
                    {s.lastPaymentDate ? format(new Date(s.lastPaymentDate), 'dd MMM yy') : '—'}
                  </td>
                  <td className="text-right">
                    <span className={`text-[13px] font-bold ${s.currentBalance > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
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
                      className="btn btn-secondary btn-sm gap-1"
                    >
                      Ledger <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalStudents > studentLimit && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs text-slate-400">Showing {students.length} of {totalStudents}</p>
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
          <div key={type} className="table-container">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div>
                <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">{type}</p>
                <p className="text-[10px] text-slate-400 font-medium">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-[15px] font-bold text-slate-900">{fmt(typeTotal)}</p>
              </div>
            </div>
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
                  <tr key={a._id}>
                    <td className="px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-[11px] font-bold">
                          {a.name?.charAt(0)}
                        </div>
                        <p className="text-[13px] font-semibold text-slate-800">{a.name}</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral lowercase text-[10px]">{a.subType || type}</span>
                    </td>
                    <td className="text-right font-bold text-[13px] text-slate-900">
                      {fmt(a.currentBalance)}
                    </td>
                    <td className="px-5 text-right">
                      <button
                        onClick={() => navigate(`/app/finance/student-accounts/${a._id}`)}
                        className="btn btn-secondary btn-sm gap-1"
                      >
                        Ledger <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default AllAccounts;
