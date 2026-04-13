import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Mail, 
  Phone, 
  Clock, 
  MessageSquare, 
  Calendar, 
  MoreHorizontal, 
  Trash2, 
  CheckCircle2, 
  Clock3, 
  AlertCircle,
  Filter
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
      setError('Failed to load queries. Please try again.');
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await queryService.updateQueryStatus(id, newStatus);
      toast.success(`Query marked as ${newStatus}`);
      setQueries(prev => prev.map(q => q._id === id ? { ...q, status: newStatus } : q));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await queryService.deleteQuery(id);
      toast.success('Query deleted successfully');
      setQueries(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      toast.error('Failed to delete query');
    }
  };

  const filteredQueries = queries.filter(q => {
    const matchesSearch = 
      q.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.phone.includes(searchTerm) ||
      (q.email && q.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Contacted': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Closed': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return <AlertCircle size={12} />;
      case 'Contacted': return <Clock3 size={12} />;
      case 'Closed': return <CheckCircle2 size={12} />;
      default: return null;
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div className="p-8">
        <LoadingSkeleton type="table" rows={8} />
      </div>
    );

    if (error) return (
      <div className="p-12">
        <ErrorState message={error} onRetry={loadQueries} />
      </div>
    );

    if (filteredQueries.length === 0) return (
      <div className="p-12">
        <EmptyState
          title="No Queries Found"
          message={searchTerm || statusFilter !== 'All' ? "Try adjusting your filters." : "You're all caught up! No new interest queries."}
          icon={MessageSquare}
        />
      </div>
    );

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Date</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest / Message</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Time</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredQueries.map((query) => (
              <tr key={query._id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#044343] font-black shadow-sm">
                      {query.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">{query.fullName}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        <Calendar size={10} />
                        {format(new Date(query.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                      <Phone size={12} className="text-teal-600" />
                      {query.phone}
                    </div>
                    {query.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                        <Mail size={12} className="text-teal-600" />
                        {query.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="max-w-xs">
                    <p className="text-xs font-semibold text-slate-600 line-clamp-2 italic">
                      "{query.message}"
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                    <Clock size={14} className="text-slate-400" />
                    {query.preferredContactTime}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${getStatusStyle(query.status)}`}>
                    {getStatusIcon(query.status)}
                    {query.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select 
                      value={query.status}
                      onChange={(e) => handleStatusUpdate(query._id, e.target.value)}
                      className="bg-white border border-slate-200 text-[#044343] px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#044343]/5"
                    >
                      <option value="New">Set New</option>
                      <option value="Contacted">Mark Contacted</option>
                      <option value="Closed">Close Query</option>
                    </select>
                    <button 
                      onClick={() => handleDelete(query._id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interest Queries</h1>
          <p className="text-slate-500 font-medium">Manage prospective clients and manual callback requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-bold text-xs"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-bold text-xs appearance-none"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default QueriesDashboard;
