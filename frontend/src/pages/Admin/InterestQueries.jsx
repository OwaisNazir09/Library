import React from 'react';
import { useGetQueriesQuery, useUpdateQueryMutation } from '../../store/api/adminApi';
import {
  MessageSquare, Search, Mail, Phone, Clock, Calendar,
  CheckCircle2, Loader2, User, MoreHorizontal, Trash2,
  ExternalLink, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  New: { badge: 'badge-info', label: 'New' },
  Contacted: { badge: 'badge-warning', label: 'Contacted' },
  'Demo Scheduled': { badge: 'badge-neutral', label: 'Demo Scheduled' },
  Converted: { badge: 'badge-success', label: 'Converted' },
  Closed: { badge: 'badge-danger', label: 'Closed' },
};

const InterestQueries = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState(null);
  const [actionMenu, setActionMenu] = React.useState(null);

  const { data: queriesData, isLoading } = useGetQueriesQuery();
  const [updateQueryMutation] = useUpdateQueryMutation();

  const queries = queriesData?.data || [];

  const onUpdateStatus = async (id, status) => {
    try {
      await updateQueryMutation({ id, data: { status } }).unwrap();
      toast.success(`Lead marked as "${status}"`);
      setActionMenu(null);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = queries.filter((q) => {
    const matchSearch =
      q.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.phone?.includes(searchTerm) ||
      q.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: queries.length,
    New: queries.filter((q) => q.status === 'New').length,
    Contacted: queries.filter((q) => q.status === 'Contacted').length,
    Converted: queries.filter((q) => q.status === 'Converted').length,
    Closed: queries.filter((q) => q.status === 'Closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Interest Queries</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage inbound leads and platform interest from potential tenants.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[11px] font-semibold text-[#044343] shadow-sm">
          <MessageSquare size={13} />
          {counts.New} New Leads
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: `All (${counts.all})`, value: 'all' },
            { label: `New (${counts.New})`, value: 'New' },
            { label: `Contacted (${counts.Contacted})`, value: 'Contacted' },
            { label: `Converted (${counts.Converted})`, value: 'Converted' },
            { label: `Closed (${counts.Closed})`, value: 'Closed' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                statusFilter === f.value
                  ? 'bg-[#044343] text-white border-[#044343]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Pref. Time</th>
              <th>Received</th>
              <th>Status</th>
              <th className="px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" className="text-center py-16">
                <Loader2 className="animate-spin inline-block text-[#044343]" size={24} />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <MessageSquare size={36} className="text-slate-200" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">No interest queries found</p>
                    <p className="text-[12px] text-slate-400 mt-1">Marketing leads from the public website will appear here.</p>
                  </div>
                </div>
              </td></tr>
            ) : filtered.map((query) => {
              const sc = statusConfig[query.status] || statusConfig.New;
              return (
                <React.Fragment key={query._id}>
                  <tr
                    className="cursor-pointer hover:bg-slate-50/60 transition-colors"
                    onClick={() => setExpandedId(expandedId === query._id ? null : query._id)}
                  >
                    <td className="px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <User size={14} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-900 leading-none">{query.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[12px] text-slate-600 flex items-center gap-1.5">
                        <Mail size={11} className="text-slate-300" />
                        {query.email || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-[12px] text-slate-600 flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-300" />
                        {query.phone}
                      </span>
                    </td>
                    <td>
                      <p className="text-[12px] text-slate-500 max-w-[220px] truncate">{query.message}</p>
                    </td>
                    <td>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{query.preferredContactTime}</span>
                    </td>
                    <td>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-300" />
                        {query.createdAt ? format(parseISO(query.createdAt), 'dd MMM yyyy') : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${sc.badge}`}>{sc.label}</span>
                    </td>
                    <td className="px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenu(actionMenu === query._id ? null : query._id)}
                          className="btn btn-ghost btn-sm w-8 h-8 p-0 rounded-lg"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {actionMenu === query._id && (
                          <div className="absolute right-0 top-9 z-20 bg-white border border-slate-100 rounded-xl shadow-xl w-48 py-2">
                            {[
                              { label: 'Mark Contacted', status: 'Contacted', icon: CheckCircle2 },
                              { label: 'Demo Scheduled', status: 'Demo Scheduled', icon: Calendar },
                              { label: 'Convert to Library', status: 'Converted', icon: ExternalLink },
                              { label: 'Close Lead', status: 'Closed', icon: Trash2 },
                            ].map((a, i) => (
                              <button
                                key={i}
                                onClick={() => onUpdateStatus(query._id, a.status)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[12px] font-semibold text-slate-700 transition-colors"
                              >
                                <a.icon size={13} className="text-slate-400" />
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded message row */}
                  {expandedId === query._id && (
                    <tr className="bg-slate-50">
                      <td colSpan="8" className="px-6 py-4">
                        <div className="p-4 bg-white border border-slate-100 rounded-xl">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Message</p>
                          <p className="text-[13px] text-slate-700 leading-relaxed">{query.message}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterestQueries;
