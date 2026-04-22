import React from 'react';
import {
  useUpdateTenantMutation,
  useGetBillingDataQuery,
  useGetPlansQuery,
  useGetSubscriptionAnalyticsQuery
} from '../../store/api/adminApi';
import {
  CreditCard, Search, CheckCircle, Clock,
  XCircle, TrendingUp, Loader2, Calendar, MoreHorizontal,
  RefreshCw, ShieldOff, ShieldCheck, FileText, Download,
  ExternalLink, User as UserIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  active: { label: 'Active', badge: 'badge-success' },
  trial: { label: 'Trial', badge: 'badge-info' },
  expired: { label: 'Expired', badge: 'badge-danger' },
  suspended: { label: 'Suspended', badge: 'badge-warning' },
};

const BillingSubscriptions = () => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [actionMenu, setActionMenu] = React.useState(null);

  const { data: billingData, isLoading: billingLoading } = useGetBillingDataQuery();
  const { data: statsData } = useGetSubscriptionAnalyticsQuery();
  const [updateTenant] = useUpdateTenantMutation();

  const records = billingData?.data || [];
  const stats = statsData?.data || { totalRevenue: 0, mrr: 0, activeSubscriptions: 0 };

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.libraryName?.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.libraryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onAction = async (id, payload, label) => {
    try {
      await updateTenant({ id, data: payload }).unwrap();
      toast.success(`${label} applied successfully`);
      setActionMenu(null);
    } catch {
      toast.error('Action failed. Please try again.');
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Subscriptions</h1>
          <p className="text-sm font-medium text-slate-500">Global SaaS revenue oversight and tenant ledger</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-md border-slate-200">
            <Download size={14} className="mr-2" /> Export CSV
          </button>
          <button className="btn btn-primary btn-md shadow-lg shadow-teal-900/10">
            <RefreshCw size={14} className="mr-2" /> Reconcile
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Lifetime earnings' },
          { label: 'Estimated MRR', value: fmt(stats.mrr), icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50', sub: 'Monthly Recurring' },
          { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-50', sub: 'Paid libraries' },
          { label: 'Expiring Soon', value: records.filter(r => r.libraryStatus === 'trial').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Trials ending' },
        ].map((c, i) => (
          <div key={i} className="card p-6 border-transparent shadow-sm bg-white hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <c.icon size={24} className={c.color} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{c.value}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library, owner or email..."
            className="input pl-12 h-12 w-full bg-white border-slate-200 focus:border-teal-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {['all', 'active', 'trial', 'expired', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden border-transparent shadow-sm">
        <div className="overflow-x-auto">
          <table className="table-main min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4">Library / Owner</th>
                <th>Plan & Cycle</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>Next Due</th>
                <th>Payment Status</th>
                <th>Auto Renew</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billingLoading ? (
                <tr><td colSpan="8" className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-teal-600" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Billing Records...</p>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-20">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <FileText size={48} className="text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">No records match your criteria</p>
                  </div>
                </td></tr>
              ) : filtered.map((record) => {
                const status = statusConfig[record.libraryStatus] || { label: record.libraryStatus, badge: 'badge-neutral' };

                return (
                  <tr key={record.libraryId} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm">
                          {record.libraryName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{record.libraryName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <UserIcon size={10} className="text-slate-400" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{record.ownerName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{record.plan}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{record.billingCycle}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[13px] font-black text-slate-900">{fmt(record.amount)}</span>
                    </td>
                    <td>
                      <span className="text-[12px] font-bold text-slate-600">
                        {record.startDate ? format(parseISO(record.startDate), 'dd MMM yyyy') : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-slate-300" />
                        <span className={`text-[12px] font-bold ${new Date(record.nextDue) < new Date() ? 'text-rose-500' : ''}`}>
                          {record.nextDue ? format(parseISO(record.nextDue), 'dd MMM yyyy') : '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                        record.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                        record.paymentStatus === 'Trial' ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {record.paymentStatus === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {record.paymentStatus}
                      </div>
                    </td>
                    <td>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${record.autoRenewal ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${record.autoRenewal ? 'left-4.5' : 'left-0.5'}`} />
                      </div>
                    </td>
                    <td className="px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="View Invoice">
                          <FileText size={18} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === record.libraryId ? null : record.libraryId)}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {actionMenu === record.libraryId && (
                            <div className="absolute right-0 top-10 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-56 py-2 animate-in fade-in zoom-in duration-200">
                              <button
                                onClick={() => onAction(record.libraryId, { status: 'active' }, 'Activate')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-teal-600 transition-colors"
                              >
                                <ShieldCheck size={16} /> Activate Library
                              </button>
                              <button
                                onClick={() => onAction(record.libraryId, { status: 'suspended' }, 'Suspend')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-rose-600 transition-colors"
                              >
                                <ShieldOff size={16} /> Suspend Library
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[12px] font-bold text-slate-700 transition-colors"
                              >
                                <ExternalLink size={16} /> Login as Admin
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingSubscriptions;
