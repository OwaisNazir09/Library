import React from 'react';
import { useGetQueriesQuery, useUpdateQueryMutation } from '../../store/api/adminApi';
import {
  MessageSquare, Search, Mail, Phone, Clock, Calendar,
  CheckCircle2, Loader2, User, MoreHorizontal, Trash2,
  ExternalLink, Filter, UserPlus, FileText, BadgeCheck,
  Headphones, DollarSign, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  New: { badge: 'badge-info', label: 'New Lead' },
  Contacted: { badge: 'badge-warning', label: 'Contacted' },
  'Demo Scheduled': { badge: 'bg-indigo-100 text-indigo-700', label: 'Demo Set' },
  Converted: { badge: 'badge-success', label: 'Converted' },
  Closed: { badge: 'badge-danger', label: 'Closed' },
};

const InterestQueries = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState(null);
  const [actionMenu, setActionMenu] = React.useState(null);

  const { data: queriesData, isLoading, refetch } = useGetQueriesQuery();
  const [updateQueryMutation] = useUpdateQueryMutation();

  const queries = queriesData?.data || [];

  const onUpdateStatus = async (id, status) => {
    try {
      await updateQueryMutation({ id, data: { status } }).unwrap();
      toast.success(`Lead status updated to "${status}"`);
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lead Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Automated inbound pipeline management.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} />
              {counts.New} Unassigned
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, email, context..."
            className="w-full bg-slate-50 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All Pipelines', value: 'all' },
            { label: 'Fresh Leads', value: 'New' },
            { label: 'Active Pursuit', value: 'Contacted' },
            { label: 'Closures', value: 'Converted' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                statusFilter === f.value
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="card p-0 overflow-hidden bg-white border-transparent shadow-sm">
        <div className="overflow-x-auto">
          <table className="table-main">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5">Potential Tenant</th>
                <th>Communication Channel</th>
                <th>Context / Message</th>
                <th>Sales Velocity</th>
                <th>Status</th>
                <th className="px-8 text-right">Pipeline Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-24"><Loader2 className="animate-spin inline-block text-slate-200" size={32} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-32 opacity-30">
                  <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pipeline Empty</p>
                </td></tr>
              ) : filtered.map((query) => {
                const sc = statusConfig[query.status] || statusConfig.New;
                const isExpanded = expandedId === query._id;
                return (
                  <React.Fragment key={query._id}>
                    <tr className={`group hover:bg-slate-50/50 transition-all ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
                            {query.fullName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-slate-900 leading-none">{query.fullName}</p>
                            <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-tighter">Inbound Lead</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                            <Mail size={12} className="text-slate-300" /> {query.email || 'NO_EMAIL'}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                            <Phone size={12} className="text-slate-300" /> {query.phone}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[200px]">
                        <button onClick={() => setExpandedId(isExpanded ? null : query._id)} className="text-[12px] font-bold text-slate-600 text-left line-clamp-2 hover:text-slate-900 transition-colors">
                          {query.message}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                           <Clock size={12} className="text-slate-300" />
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{query.preferredContactTime || 'ANYTIME'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${sc.badge} font-black text-[9px] uppercase tracking-widest`}>{sc.label}</span>
                      </td>
                      <td className="px-8 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActionMenu(actionMenu === query._id ? null : query._id)}
                            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {actionMenu === query._id && (
                            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl w-56 py-2 animate-in zoom-in-95 duration-200">
                              <div className="px-4 py-2 border-b border-slate-50 mb-2">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pipeline Movement</p>
                              </div>
                              <button onClick={() => onUpdateStatus(query._id, 'Contacted')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[11px] font-black text-slate-700 uppercase tracking-tight">
                                <Headphones size={14} className="text-amber-500" /> Mark as Contacted
                              </button>
                              <button onClick={() => onUpdateStatus(query._id, 'Demo Scheduled')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[11px] font-black text-slate-700 uppercase tracking-tight">
                                <Calendar size={14} className="text-indigo-500" /> Schedule Demo
                              </button>
                              <button onClick={() => onUpdateStatus(query._id, 'Converted')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                                <BadgeCheck size={14} /> Convert to Library
                              </button>
                              <div className="h-px bg-slate-50 my-2" />
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[11px] font-black text-indigo-600 uppercase tracking-tight">
                                <UserPlus size={14} /> Assign to Sales
                              </button>
                              <button onClick={() => onUpdateStatus(query._id, 'Closed')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left text-[11px] font-black text-rose-500 uppercase tracking-tight">
                                <Trash2 size={14} /> Close Lead
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="6" className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <FileText size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Context</span>
                              </div>
                              <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{query.message}</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Intelligence</span>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Received On</p>
                                  <p className="text-xs font-black text-slate-900">{format(parseISO(query.createdAt), 'PPPP')}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes</p>
                                  <textarea className="w-full bg-transparent border-none text-[12px] font-bold text-slate-600 placeholder:text-slate-300 focus:ring-0 resize-none" placeholder="Add internal lead notes here..." rows={2} />
                                </div>
                              </div>
                            </div>
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
    </div>
  );
};

export default InterestQueries;
