import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Mail, Phone, Clock, MessageSquare, Calendar, 
  MoreHorizontal, Trash2, CheckCircle2, Clock3, AlertCircle, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import queryService from '../../services/queryService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const QueriesDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadQueries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await queryService.getQueries();
      setQueries(data.data.queries);
      setError(null);
    } catch (err) {
      setError('Failed to load queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueries(); }, [loadQueries]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await queryService.updateQueryStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      setQueries(prev => prev.map(q => q._id === id ? { ...q, status: newStatus } : q));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await queryService.deleteQuery(id);
      toast.success('Query deleted');
      setQueries(prev => prev.filter(q => q._id !== id));
    } catch (err) {}
  };

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || q.phone.includes(searchTerm) || (q.email && q.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'New': return 'badge-info';
      case 'Contacted': return 'badge-warning';
      case 'Closed': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-5"><LoadingSkeleton type="table" rows={10} /></div>;
    if (error) return <div className="p-10"><ErrorState message={error} onRetry={loadQueries} /></div>;
    if (!filteredQueries.length) return <div className="p-10 text-center text-slate-400 italic text-xs">No queries match the selected filters.</div>;

    return (
      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Lead / Date</th>
              <th>Contact Details</th>
              <th>Message / Interest</th>
              <th>Preferred Time</th>
              <th>Status</th>
              <th className="px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map((query) => (
              <tr key={query._id}>
                <td className="px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#044343] font-bold text-[11px] border border-teal-100">
                      {query.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 leading-none">{query.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">{format(new Date(query.createdAt), 'dd MMM yy')}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600"><Phone size={12} className="text-slate-400" /> {query.phone}</div>
                    {query.email && <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 lowercase"><Mail size={12} /> {query.email}</div>}
                  </div>
                </td>
                <td>
                  <p className="text-[12px] text-slate-600 line-clamp-1 italic max-w-[200px]">"{query.message}"</p>
                </td>
                <td className="text-[12px] font-medium text-slate-500">
                   {query.preferredContactTime}
                </td>
                <td>
                   <span className={`badge ${getBadgeStyle(query.status)} lowercase`}>{query.status}</span>
                </td>
                <td className="px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select value={query.status} onChange={(e) => handleStatusUpdate(query._id, e.target.value)} className="bg-white border border-slate-200 text-slate-700 px-2 h-7 rounded text-[11px] font-bold outline-none focus:ring-2 focus:ring-teal-500/10">
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button onClick={() => handleDelete(query._id)} className="btn btn-ghost btn-sm w-7 h-7 p-0 text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Interest Queries</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage inbound platform leads and prospect inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg h-[34px] px-3 text-[12px] font-bold text-slate-600 outline-none">
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default QueriesDashboard;
