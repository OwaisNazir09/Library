import React from 'react';
import { useGetTablesQuery, useAddTableMutation, useUpdateTableMutation, useDeleteTableMutation, useAssignTableMutation, useUnassignTableMutation } from '../../store/api/studyDeskApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import {
  Search,
  Filter,
  Plus,
  Coffee,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  X,
  Calendar,
  IndianRupee,
  MapPin,
  Key,
  ShieldCheck,
  Building2,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronRight
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
      toast.success('Table created successfully');
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
    }
  };

  const onAssignSubmit = async (data) => {
    try {
      await assignTableMutation({ id: selectedTable._id, ...data }).unwrap();
      toast.success('Table assigned effectively');
      setIsAssignModalOpen(false);
      resetAssign();
      setSelectedTable(null);
    } catch (err) {
      // Handled globally
    }
  };

  const handleUnassign = async (id) => {
    if (window.confirm('Are you sure you want to unassign this student?')) {
      try {
        await unassignTableMutation(id).unwrap();
        toast.success('Table unassigned');
      } catch (err) {
        // Handled globally
      }
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'Available': 'bg-emerald-100 text-emerald-600',
      'Assigned': 'bg-blue-100 text-blue-600',
      'Maintenance': 'bg-amber-100 text-amber-600',
      'Reserved': 'bg-purple-100 text-purple-600',
      'Expired': 'bg-rose-100 text-rose-600'
    };
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${configs[status] || 'bg-slate-100'}`}>{status}</span>;
  };

  const renderTableBody = () => {
    if (loading && items.length === 0) return <tr><td colSpan="7" className="p-8"><LoadingSkeleton type="table" rows={6} /></td></tr>;
    if (error) return <tr><td colSpan="7" className="p-12"><ErrorState message={error.data?.message || 'Error loading tables'} onRetry={refetch} /></td></tr>;
    if (items.length === 0) return <tr><td colSpan="7" className="p-12"><EmptyState title="No Tables" message="Start by creating study desks for your library." icon={Coffee} /></td></tr>;

    return items.map((table) => (
      <tr key={table._id} className="hover:bg-slate-50/50 transition-colors group">
        <td className="px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#044343] group-hover:text-white transition-all">
              <Coffee size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">Table {table.tableNumber}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">{table.tableName || table.section}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{table.section} / Floor {table.floor || 'G'}</span>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-2">
            <Key size={12} className="text-teal-600" />
            <span className="text-xs font-black text-slate-900">{table.keyNumber || 'N/A'}</span>
          </div>
        </td>
        <td className="px-6 py-5">
          {table.assignedTo ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">{table.assignedTo.fullName}</p>
                <p className="text-[9px] text-slate-400 font-bold truncate uppercase">{table.assignedTo.email}</p>
              </div>
            </div>
          ) : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Unassigned</span>}
        </td>
        <td className="px-6 py-5">
          {getStatusBadge(table.status)}
        </td>
        <td className="px-6 py-5">
          {table.validUntil ? (
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900">{format(new Date(table.validUntil), 'MMM dd, yyyy')}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                {differenceInDays(new Date(table.validUntil), new Date())} Days left
              </span>
            </div>
          ) : '-'}
        </td>
        <td className="px-8 py-5 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {table.status === 'Available' ? (
              <button
                onClick={() => { setSelectedTable(table); setIsAssignModalOpen(true); }}
                disabled={isAssigning}
                className="btn btn-sm btn-primary"
              >
                {isAssigning ? <Loader2 size={12} className="animate-spin" /> : 'Assign'}
              </button>
            ) : (
              <button
                onClick={() => handleUnassign(table._id)}
                disabled={isUnassigning}
                className="btn btn-sm btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                {isUnassigning ? <Loader2 size={12} className="animate-spin" /> : 'Unassign'}
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            <span>Library</span>
            <ChevronRight size={12} />
            <span className="text-[#044343]">Facilities</span>
          </div>
          <h1>Study Desk Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter table or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-64"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary btn-default"
          >
            <Plus size={16} />
            Add New Desk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Available', count: items.filter(t => t.status === 'Available').length, color: 'emerald' },
          { label: 'Assigned', count: items.filter(t => t.status === 'Assigned').length, color: 'blue' },
          { label: 'Maintenance', count: items.filter(t => t.status === 'Maintenance').length, color: 'amber' },
          { label: 'Expired', count: items.filter(t => t.status === 'Expired').length, color: 'rose' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label} Desks</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.count}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <ShieldCheck size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="compact-table-container">
        <table className="compact-table">
          <thead>
            <tr>
              <th>Table Assets</th>
              <th>Location/Zone</th>
              <th>Key Code</th>
              <th>Active Resident</th>
              <th>Badge</th>
              <th>Valid Until</th>
              <th className="text-right">Admin Control</th>
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination
          total={total}
          limit={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Add Table Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content modal-md max-h-[90vh]">
              <div className="modal-header">
                <h2>Define Study Desk</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onAddTable)} className="flex flex-col overflow-hidden">
                <div className="modal-body space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="input-label">Table Number *</label>
                      <input {...register('tableNumber', { required: true })} className="input-field" placeholder="e.g. T-101" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="input-label">Table Name</label>
                      <input {...register('tableName')} className="input-field" placeholder="e.g. Corner Desk" />
                    </div>
                    <div>
                      <label className="input-label">Section / Zone</label>
                      <select {...register('section')} className="input-field">
                        <option value="General">General Hall</option>
                        <option value="Reading Hall">Reading Hall</option>
                        <option value="Private Room">Private Room</option>
                        <option value="Silent Zone">Silent Zone</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Floor Number</label>
                      <input {...register('floor')} className="input-field" placeholder="e.g. 1st Floor" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                    <div>
                      <label className="input-label">Key Code / Number</label>
                      <input {...register('keyNumber')} className="input-field" placeholder="K-99" />
                    </div>
                    <div>
                      <label className="input-label">Locker Number</label>
                      <input {...register('lockerNumber')} className="input-field" placeholder="L-50" />
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <input type="checkbox" {...register('hasStorage')} id="storage" className="w-4 h-4 accent-[#044343]" />
                      <label htmlFor="storage" className="text-[12px] font-medium text-slate-700 cursor-pointer">Has Integrated Storage / Drawers</label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-default">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="btn btn-primary btn-default min-w-[120px]"
                  >
                    {isAdding ? <Loader2 size={16} className="animate-spin" /> : 'Add Desk'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Table Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content modal-sm">
              <div className="modal-header">
                <h2>Assign Table {selectedTable?.tableNumber}</h2>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="flex flex-col overflow-hidden">
                <div className="modal-body space-y-4">
                  <div>
                    <label className="input-label">Select Member</label>
                    <select {...regAssign('userId', { required: true })} className="input-field">
                      <option value="">Choose a student...</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.fullName} ({u.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Valid Until</label>
                    <input type="date" {...regAssign('validUntil', { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Monthly Fee (₹)</label>
                    <input type="number" {...regAssign('fee')} className="input-field" placeholder="500" />
                  </div>
                  <div>
                    <label className="input-label">Security Deposit (₹)</label>
                    <input type="number" {...regAssign('deposit')} className="input-field" placeholder="0" />
                  </div>
                  <div className="col-span-1">
                    <label className="input-label">Admin Notes</label>
                    <input {...regAssign('notes')} className="input-field" placeholder="Any special requests..." />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary btn-default">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="btn btn-primary btn-default min-w-[120px]"
                  >
                    {isAssigning ? <Loader2 size={16} className="animate-spin" /> : 'Assign'}
                  </button>
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
