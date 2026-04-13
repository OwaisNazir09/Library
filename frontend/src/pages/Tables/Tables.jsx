import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, addTable, updateTable, deleteTable, assignTable, unassignTable } from '../../store/slices/tableSlice';
import { fetchUsers } from '../../store/slices/userSlice';
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
  Loader2
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
  const dispatch = useDispatch();
  const { items, loading, error, total } = useSelector((state) => state.tables);
  const { items: users } = useSelector((state) => state.users);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [selectedTable, setSelectedTable] = React.useState(null);
  
  const limit = 10;

  const { register, handleSubmit, reset } = useForm();
  const { register: regAssign, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm();

  const loadData = React.useCallback(() => {
    dispatch(fetchTables({
      page: currentPage,
      limit,
      search: searchTerm
    }));
    dispatch(fetchUsers({ limit: 1000, role: 'member' }));
  }, [dispatch, currentPage, searchTerm]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onAddTable = async (data) => {
    try {
      await dispatch(addTable(data)).unwrap();
      toast.success('Table created successfully');
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to create table');
    }
  };

  const onAssignSubmit = async (data) => {
    try {
      await dispatch(assignTable({ id: selectedTable._id, ...data })).unwrap();
      toast.success('Table assigned effectively');
      setIsAssignModalOpen(false);
      resetAssign();
      setSelectedTable(null);
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    }
  };

  const handleUnassign = async (id) => {
    if (window.confirm('Are you sure you want to unassign this student?')) {
      try {
        await dispatch(unassignTable(id)).unwrap();
        toast.success('Table unassigned');
      } catch (err) {
        toast.error(err.message || 'Failed to unassign');
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
    if (error) return <tr><td colSpan="7" className="p-12"><ErrorState message={error} onRetry={loadData} /></td></tr>;
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
           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {table.status === 'Available' ? (
                <button 
                  onClick={() => { setSelectedTable(table); setIsAssignModalOpen(true); }}
                  className="px-4 py-2 bg-[#044343] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#033636] transition-all shadow-md active:scale-95"
                >
                  Assign Desk
                </button>
              ) : (
                <button 
                  onClick={() => handleUnassign(table._id)}
                  className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                >
                  Unassign
                </button>
              )}
           </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Study Desk Management</h1>
          <p className="text-slate-500 font-medium italic">Assign private desks, track keys, lockers and student study zones.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter table or student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl w-72 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-bold text-xs"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#044343] text-white rounded-2xl font-black text-xs shadow-xl shadow-teal-900/10 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus size={18} />
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

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Table Assets</th>
                <th className="px-6 py-5">Location/Zone</th>
                <th className="px-6 py-5">Key Code</th>
                <th className="px-6 py-5">Active Resident</th>
                <th className="px-6 py-5">Badge</th>
                <th className="px-6 py-5">Valid Until</th>
                <th className="px-8 py-5 text-right">Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]">
               <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-xl">
                 <X size={24} />
               </button>
               <div className="mb-10">
                 <h2 className="text-3xl font-black text-slate-900">Define Study Desk</h2>
                 <p className="text-slate-500 font-bold mt-1">Configure physical parameters, zone and key details.</p>
               </div>
               
               <form onSubmit={handleSubmit(onAddTable)} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Table Number *</label>
                      <input {...register('tableNumber', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none font-bold text-sm h-[55px]" placeholder="e.g. T-101" />
                    </div>
                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Table Name</label>
                      <input {...register('tableName')} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none font-bold text-sm h-[55px]" placeholder="e.g. Corner Desk" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section / Zone</label>
                      <select {...register('section')} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none font-bold text-sm h-[55px] appearance-none">
                        <option value="General">General Hall</option>
                        <option value="Reading Hall">Reading Hall</option>
                        <option value="Private Room">Private Room</option>
                        <option value="Silent Zone">Silent Zone</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor Number</label>
                      <input {...register('floor')} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none font-bold text-sm h-[55px]" placeholder="e.g. 1st Floor" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 p-8 bg-teal-50/30 rounded-[2rem] border border-teal-100/50">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Key Code / Number</label>
                      <div className="relative">
                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-400" size={18} />
                        <input {...register('keyNumber')} className="w-full bg-white border border-teal-100 rounded-2xl py-3.5 pl-14 pr-6 outline-none font-bold text-sm h-[55px] text-teal-900" placeholder="K-99" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-teal-700 uppercase tracking-widest ml-1">Locker Number</label>
                      <input {...register('lockerNumber')} className="w-full bg-white border border-teal-100 rounded-2xl py-3.5 px-6 outline-none font-bold text-sm h-[55px] text-teal-900" placeholder="L-50" />
                    </div>
                    <div className="col-span-2 flex items-center gap-4 bg-white p-4 rounded-2xl border border-teal-100">
                       <input type="checkbox" {...register('hasStorage')} id="storage" className="w-5 h-5 accent-[#044343]" />
                       <label htmlFor="storage" className="text-xs font-black text-slate-900 uppercase tracking-widest cursor-pointer">Has Integrated Storage / Drawers</label>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-[#044343] text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/20 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Desk Addition'}
                 </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Table Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative">
               <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
                 <X size={24} />
               </button>
               <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                    <User size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">Assign Table {selectedTable?.tableNumber}</h2>
                 <p className="text-slate-400 font-bold text-sm italic">Grant study privileges to a registered member.</p>
               </div>

               <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="space-y-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Member (Registered Only)</label>
                   <select {...regAssign('userId', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none font-bold text-xs h-[55px] appearance-none">
                     <option value="">Choose a student...</option>
                     {users.map(u => (
                       <option key={u._id} value={u._id}>{u.fullName} ({u.phone})</option>
                     ))}
                   </select>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valid Until</label>
                      <input type="date" {...regAssign('validUntil', { required: true })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 font-bold text-xs h-[55px]" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Fee (₹)</label>
                       <div className="relative">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                         <input type="number" {...regAssign('fee')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 font-bold text-xs h-[55px]" placeholder="500" />
                       </div>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-[#044343] text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? <Loader2 size={18} className="animate-spin" /> : 'Execute Desk Assignment'}
                 </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tables;
