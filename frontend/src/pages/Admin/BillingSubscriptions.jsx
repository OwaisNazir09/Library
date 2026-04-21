import React from 'react';
import {
  useGetTenantsQuery,
  useUpdateTenantMutation,
  useGetPlansQuery,
  useGetSubscriptionAnalyticsQuery
} from '../../store/api/adminApi';
import {
  CreditCard, Search, AlertCircle, CheckCircle, Clock,
  XCircle, TrendingUp, Loader2, Calendar, MoreHorizontal,
  RefreshCw, ShieldOff, ShieldCheck, IndianRupee, Wallet
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const paymentStatusConfig = {
  paid: { label: 'Paid', badge: 'badge-success', icon: CheckCircle, color: 'text-emerald-500' },
  pending: { label: 'Pending', badge: 'badge-warning', icon: Clock, color: 'text-amber-500' },
  failed: { label: 'Failed', badge: 'badge-danger', icon: XCircle, color: 'text-rose-500' },
};

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

  const { data: tenantsData, isLoading: tenantsLoading } = useGetTenantsQuery({});
  const { data: plansData } = useGetPlansQuery();
  const { data: statsData } = useGetSubscriptionAnalyticsQuery();
  const [updateTenant] = useUpdateTenantMutation();

  const tenants = tenantsData?.data || [];
  const plans = plansData?.data?.plans || [];
  const stats = statsData?.data || { totalRevenue: 0, mrr: 0, activeSubscriptions: 0 };

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter || t.paymentStatus === statusFilter;
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
          <p className="text-sm text-slate-400 mt-1 font-medium text-slate-500">Global SaaS revenue oversight and tenant ledger</p>
        </div>
        <button className="btn btn-primary btn-md shadow-lg shadow-teal-900/10">
          <RefreshCw size={14} className="mr-2" /> Reconcile Payments
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Lifetime earnings' },
          { label: 'Estimated MRR', value: fmt(stats.mrr), icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50', sub: 'Monthly Recurring' },
          { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-50', sub: 'Paid libraries' },
          { label: 'Pending Payments', value: tenants.filter(t => t.paymentStatus === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Awaiting clearance' },
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
          {['all', 'active', 'pending', 'trial', 'expired', 'suspended'].map((s) => (
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
          <table className="table-main">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4">Library / Owner</th>
                <th>Package Plan</th>
                <th>Amount</th>
                <th>Billing</th>
                <th>Next Due</th>
                <th>Payment Status</th>
                <th>Library Status</th>
                <th className="px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenantsLoading ? (
                <tr><td colSpan="8" className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-teal-600" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Ledger...</p>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-20">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <Wallet size={48} className="text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">No billing records match your criteria</p>
                  </div>
                </td></tr>
              ) : filtered.map((tenant) => {
                const plan = plans.find(p => p._id === tenant.subscriptionPlanId) || { name: tenant.plan, price: 0, billingCycle: 'Monthly' };
                const payment = paymentStatusConfig[tenant.paymentStatus] || paymentStatusConfig.pending;
                const status = statusConfig[tenant.status] || { label: tenant.status, badge: 'badge-neutral' };

                return (
                  <tr key={tenant._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center font-black text-teal-700 text-sm border border-teal-100">
                          {tenant.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{tenant.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{tenant.ownerName || 'No Owner'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{plan.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{plan.billingCycle}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-900">{fmt(plan.price)}</span>
                        {tenant.paymentStatus === 'pending' && <span className="text-[10px] text-rose-500 font-bold">Outstanding</span>}
                      </div>
                    </td>
                    <td><span className="text-[12px] font-bold text-slate-600 uppercase tracking-tighter">{plan.billingCycle}</span></td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-[12px] font-bold italic">
                          {tenant.expiryDate ? format(parseISO(tenant.expiryDate), 'dd MMM yyyy') : '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${payment.badge} bg-opacity-10 font-black text-[10px] uppercase tracking-wider`}>
                        <payment.icon size={12} />
                        {payment.label}
                      </div>
                    </td>
                    <td><span className={`badge ${status.badge} font-black text-[9px] uppercase tracking-widest`}>{status.label}</span></td>
                    <td className="px-6 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenu(actionMenu === tenant._id ? null : tenant._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {actionMenu === tenant._id && (
                          <div className="absolute right-0 top-10 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-56 py-2 animate-in fade-in zoom-in duration-200">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</p>
                            </div>
                            {[
                              { label: 'Mark as Paid', payload: { paymentStatus: 'paid' }, icon: CheckCircle, color: 'text-emerald-600' },
                              { label: 'Set to Pending', payload: { paymentStatus: 'pending' }, icon: Clock, color: 'text-amber-500' },
                              { label: 'Activate Library', payload: { status: 'active' }, icon: ShieldCheck, color: 'text-teal-600' },
                              { label: 'Suspend Library', payload: { status: 'suspended' }, icon: ShieldOff, color: 'text-rose-600' },
                              { label: 'Extend Trial', payload: { status: 'trial', expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, icon: RefreshCw, color: 'text-sky-600' },
                            ].map((a, i) => (
                              <button
                                key={i}
                                onClick={() => onAction(tenant._id, a.payload, a.label)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[12px] font-bold text-slate-700 transition-colors group"
                              >
                                <a.icon size={16} className={`${a.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
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
