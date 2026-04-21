import React from 'react';
import {
  useGetTenantsQuery,
  useUpdateTenantMutation
} from '../../store/api/adminApi';
import {
  CreditCard, Search, AlertCircle, CheckCircle, Clock,
  XCircle, TrendingUp, Loader2, Calendar, MoreHorizontal,
  Filter, RefreshCw, ShieldOff, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const planLabels = {
  trial: { label: 'Trial', badge: 'badge-info' },
  starter: { label: 'Starter', badge: 'badge-success' },
  professional: { label: 'Professional', badge: 'badge-warning' },
  enterprise: { label: 'Enterprise', badge: 'badge-danger' },
};

const paymentStatusConfig = {
  paid: { label: 'Paid', badge: 'badge-success', icon: CheckCircle },
  pending: { label: 'Pending', badge: 'badge-warning', icon: Clock },
  failed: { label: 'Failed', badge: 'badge-danger', icon: XCircle },
  trial: { label: 'Trial', badge: 'badge-info', icon: Clock },
};

const BillingSubscriptions = () => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [actionMenu, setActionMenu] = React.useState(null);

  const { data, isLoading } = useGetTenantsQuery({});
  const [updateTenant] = useUpdateTenantMutation();

  const tenants = data?.data || [];

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = 0;
  const mrr = 0;
  const trialCount = tenants.filter((t) => t.status === 'trial').length;
  const expiringSoon = tenants.filter((t) => {
    if (!t.expiryDate) return false;
    const diff = (new Date(t.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const onAction = async (id, payload, label) => {
    try {
      await updateTenant({ id, data: payload }).unwrap();
      toast.success(`${label} applied successfully`);
      setActionMenu(null);
    } catch {
      toast.error('Action failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Billing & Subscriptions</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage subscription plans, billing cycles, and payment status.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'MRR', value: `₹${mrr.toLocaleString()}`, icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Trial Libraries', value: trialCount, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Expiring Soon', value: expiringSoon, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((c, i) => (
          <div key={i} className="card p-5">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
              <c.icon size={16} className={c.color} />
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{c.label}</p>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by library or email..."
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'active', 'trial', 'expired', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? 'bg-[#044343] text-white border-[#044343]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">Library</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Billing Cycle</th>
              <th>Next Billing</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" className="text-center py-16">
                <Loader2 className="animate-spin inline-block text-[#044343]" size={28} />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-16 text-slate-400 text-sm">No records found.</td></tr>
            ) : filtered.map((tenant) => {
              const plan = planLabels[tenant.plan] || { label: tenant.plan, badge: 'badge-neutral' };
              const payment = paymentStatusConfig[tenant.paymentStatus] || paymentStatusConfig.pending;
              const statusBadge = { active: 'badge-success', trial: 'badge-info', expired: 'badge-danger', suspended: 'badge-warning' }[tenant.status] || 'badge-neutral';

              return (
                <tr key={tenant._id} className="relative">
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#044343]/10 flex items-center justify-center font-bold text-[#044343] text-sm">
                        {tenant.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-none">{tenant.name}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{tenant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${plan.badge}`}>{plan.label}</span></td>
                  <td><span className="text-sm font-semibold text-slate-700">₹0</span></td>
                  <td><span className="text-[12px] text-slate-500">Monthly</span></td>
                  <td>
                    <span className="text-[12px] text-slate-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-300" />
                      {tenant.expiryDate ? format(parseISO(tenant.expiryDate), 'dd MMM yy') : '—'}
                    </span>
                  </td>
                  <td><span className={`badge ${payment.badge}`}>{payment.label}</span></td>
                  <td><span className={`badge ${statusBadge}`}>{tenant.status}</span></td>
                  <td className="px-6 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionMenu(actionMenu === tenant._id ? null : tenant._id)}
                        className="btn btn-ghost btn-sm w-8 h-8 p-0 rounded-lg"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionMenu === tenant._id && (
                        <div className="absolute right-0 top-9 z-20 bg-white border border-slate-100 rounded-xl shadow-xl w-48 py-2">
                          {[
                            { label: 'Activate', payload: { status: 'active' }, icon: ShieldCheck },
                            { label: 'Suspend', payload: { status: 'suspended' }, icon: ShieldOff },
                            { label: 'Extend Trial (+14d)', payload: { status: 'trial' }, icon: RefreshCw },
                            { label: 'Mark as Paid', payload: { paymentStatus: 'paid' }, icon: CheckCircle },
                          ].map((a, i) => (
                            <button
                              key={i}
                              onClick={() => onAction(tenant._id, a.payload, a.label)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[12px] font-semibold text-slate-700 transition-colors"
                            >
                              <a.icon size={14} className="text-slate-400" />
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
  );
};

export default BillingSubscriptions;
