import React from 'react';
import { useGetTablesQuery, useAddTableMutation, useUpdateTableMutation, useDeleteTableMutation, useAssignTableMutation, useUnassignTableMutation } from '../../store/api/studyDeskApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import {
  Search, Filter, Plus, Coffee, User, Clock, CheckCircle2, AlertCircle, 
  MoreHorizontal, X, Calendar, IndianRupee, MapPin, Key, ShieldCheck, 
  Building2, Trash2, ExternalLink, Loader2, ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const Tables = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const limit = 10;

  const { data: tablesData, isLoading: loading, error, refetch } = useGetTablesQuery({
    page: currentPage,
    limit,
    search: searchTerm
  });

  const { data: usersData } = useGetUsersQuery({ limit: 1000, role: 'member' });

  const [addTableMutation, { isLoading: isAdding }] = useAddTableMutation();
  const [assignTableMutation, { isLoading: isAssigning }] = useAssignTableMutation();
  const [unassignTableMutation, { isLoading: isUnassigning }] = useUnassignTableMutation();

  const items = tablesData?.data?.tables || tablesData?.data || [];
  const total = tablesData?.total || tablesData?.results || items.length;
  const users = usersData?.data?.users || usersData?.data || [];

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [selectedTable, setSelectedTable] = React.useState(null);

  const { register, handleSubmit, reset } = useForm();
  const { register: regAssign, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm();

  const onAddTable = async (data) => {
    try {
      await addTableMutation(data).unwrap();
      toast.success('Table created');
      setIsAddModalOpen(false);
      reset();
    } catch (err) {}
  };

  const onAssignSubmit = async (data) => {
    try {
      await assignTableMutation({ id: selectedTable._id, ...data }).unwrap();
      toast.success('Table assigned');
      setIsAssignModalOpen(false);
      resetAssign();
      setSelectedTable(null);
    } catch (err) {}
  };

  const handleUnassign = async (id) => {
    if (window.confirm('Unassign this desk?')) {
      try {
        await unassignTableMutation(id).unwrap();
        toast.success('Table unassigned');
      } catch (err) {}
    }
  };

  const getBadgeStyle = (status) => {
    switch(status) {
      case 'Available': return 'badge-success';
      case 'Assigned': return 'badge-info';
      case 'Maintenance': return 'badge-warning';
      case 'Expired': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) return <tr><td colSpan="7" className="p-8"><LoadingSkeleton type="table" rows={10} /></td></tr>;
    if (error) return <tr><td colSpan="7" className="p-12"><ErrorState message="Error loading tables" onRetry={refetch} /></td></tr>;
    if (!items.length) return <tr><td colSpan="7" className="p-12"><EmptyState title="No tables found" icon={Coffee} /></td></tr>;

    return items.map((table) => (
      <tr key={table._id}>
        <td className="px-5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-teal-50 flex items-center justify-center text-[#044343] border border-teal-100">
              <Coffee size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-900 leading-none">Table {table.tableNumber}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{table.section}</p>
            </div>
          </div>
        </td>
        <td className="text-[12px] font-medium text-slate-600">
           Floor {table.floor || 'G'} / {table.section}
        </td>
        <td>
          <div className="flex items-center gap-1.5">
            <Key size={12} className="text-teal-600" />
            <span className="text-[12px] font-bold text-slate-900">{table.keyNumber || 'N/A'}</span>
          </div>
        </td>
        <td className="px-5">
          {table.assignedTo ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <User size={12} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-900 truncate max-w-[120px]">{table.assignedTo.fullName}</p>
              </div>
            </div>
          ) : <span className="text-[10px] font-semibold text-slate-300 italic">Available</span>}
        </td>
        <td>
          <span className={`badge ${getBadgeStyle(table.status)} lowercase`}>{table.status}</span>
        </td>
        <td className="text-[11px] font-medium text-slate-500">
          {table.validUntil ? format(new Date(table.validUntil), 'dd MMM yy') : '-'}
        </td>
        <td className="px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {table.status === 'Available' ? (
              <button onClick={() => { setSelectedTable(table); setIsAssignModalOpen(true); }} className="btn btn-primary btn-sm px-4">Assign</button>
            ) : (
              <button onClick={() => handleUnassign(table._id)} className="btn btn-secondary btn-sm text-rose-500">Unassign</button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Study Desk Management</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and allocate private study spaces</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search desks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-md">
            <Plus size={16} /> <span className="hidden sm:inline">Add Desk</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available', count: items.filter(t => t.status === 'Available').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Assigned', count: items.filter(t => t.status === 'Assigned').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Expired', count: items.filter(t => t.status === 'Expired').length, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'All Desks', count: items.length, color: 'text-slate-600', bg: 'bg-slate-50' }
        ].map(stat => (
          <div key={stat.label} className="card py-3.5 px-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stat.count}</h3>
            </div>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <ShieldCheck size={18} />
            </div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Desk Asset</th>
              <th>Location</th>
              <th>Key Code</th>
              <th className="px-5">Assigned To</th>
              <th>Status</th>
              <th>Valid Until</th>
              <th className="px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {items.length} records</p>
        <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-md">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Define New Desk</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onAddTable)} className="flex flex-col">
                <div className="modal-b space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5"><label className="label">Desk ID *</label><input {...register('tableNumber', { required: true })} className="input" placeholder="T-01" /></div>
                     <div className="space-y-1.5"><label className="label">Section</label><select {...register('section')} className="input"><option value="General">General</option><option value="Silent Zone">Silent Zone</option></select></div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5"><label className="label">Floor</label><input {...register('floor')} className="input" placeholder="G" /></div>
                     <div className="space-y-1.5"><label className="label">Key Number</label><input {...register('keyNumber')} className="input" /></div>
                   </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isAdding} className="btn btn-primary btn-md px-8 min-w-[120px]">{isAdding ? <Loader2 size={16} className="animate-spin" /> : 'Save Desk'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-sm">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Assign Table {selectedTable?.tableNumber}</h2>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
              </div>
              <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="flex flex-col">
                <div className="modal-b space-y-4">
                   <div className="space-y-1.5">
                     <label className="label">Select Member</label>
                     <select {...regAssign('userId', { required: true })} className="input">
                        <option value="">Choose student...</option>
                        {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="label">Expiry Date</label>
                     <input type="date" {...regAssign('validUntil', { required: true })} className="input" />
                   </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isAssigning} className="btn btn-primary btn-md px-8 min-w-[120px]">{isAssigning ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Assignment'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tables;
