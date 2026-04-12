import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, bookTable } from '../../store/slices/tableSlice';
import { Coffee, Users, Clock, X, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const TableBooking = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.tables);
  const [selectedTable, setSelectedTable] = React.useState(null);
  const { register, handleSubmit, reset } = useForm();

  const loadTables = React.useCallback(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  React.useEffect(() => {
    loadTables();
  }, [loadTables]);

  const onBook = async (data) => {
    const result = await dispatch(bookTable({ tableId: selectedTable.id || selectedTable._id, ...data }));
    if (bookTable.fulfilled.match(result)) {
      toast.success('Table reservation confirmed');
      setSelectedTable(null);
      reset();
    }
  };

  const renderContent = () => {
    if (loading && items.length === 0) {
      return <LoadingSkeleton type="card" rows={8} />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadTables} />;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <EmptyState 
          title="No Tables Available" 
          message="All study tables are currently booked or the library layout hasn't been configured yet."
          icon={Coffee}
        />
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {items.map((table) => (
          <div 
            key={table.id || table._id}
            onClick={() => table.status === 'available' && setSelectedTable(table)}
            className={`glass-card p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
              table.status === 'available' 
                ? 'hover:border-[#044343]/30 hover:shadow-xl hover:shadow-teal-900/5' 
                : 'opacity-60 grayscale cursor-not-allowed bg-slate-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              table.status === 'available' ? 'bg-teal-50 text-[#044343]' : 'bg-rose-50 text-rose-500'
            }`}>
              <Coffee size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{table.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
              <Users size={10} /> {table.capacity} Seats
            </p>
            <div className={`mt-4 w-full h-1.5 rounded-full overflow-hidden bg-slate-100`}>
               <div className={`h-full ${table.status === 'available' ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-full'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Table Reservations</h1>
          <p className="text-slate-500 font-medium">Select a zone and book your preferred study spot.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 px-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase text-slate-400">Available</span>
           </div>
           <div className="flex items-center gap-2 px-3 border-l border-slate-100">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black uppercase text-slate-400">Occupied</span>
           </div>
        </div>
      </div>

      {renderContent()}

      {/* Booking Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setSelectedTable(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-50 text-[#044343] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coffee size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Book {selectedTable.name}</h2>
              <p className="text-slate-400 text-sm font-medium">Reserve this spot for your study session.</p>
            </div>
            
            <form onSubmit={handleSubmit(onBook)} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input {...register('date')} type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input {...register('startTime')} type="time" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input {...register('endTime')} type="time" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#044343] text-white font-black py-4 rounded-3xl mt-4 shadow-xl shadow-teal-900/10 active:scale-95 transition-all">
                Confirm Reservation
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TableBooking;
