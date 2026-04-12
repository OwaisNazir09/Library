import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, createEvent } from '../../store/slices/eventSlice';
import { Calendar, MapPin, Users, Plus, Clock, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const EventList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.events);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadEvents = React.useCallback(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  React.useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onAddEvent = async (data) => {
    const result = await dispatch(createEvent(data));
    if (createEvent.fulfilled.match(result)) {
      toast.success('Event scheduled successfully!');
      setIsModalOpen(false);
      reset();
    }
  };

  const renderContent = () => {
    if (loading && items.length === 0) {
      return <LoadingSkeleton type="card" rows={6} />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadEvents} />;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <EmptyState 
          title="No Upcoming Events" 
          message="Your library calendar is currently clear. Why not organize a workshop or book reading?"
          onAction={() => setIsModalOpen(true)}
          actionLabel="Schedule First Event"
          icon={Calendar}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((event) => (
          <div key={event.id || event._id} className="glass-card flex flex-col group overflow-hidden hover:translate-y-[-8px] transition-all duration-500">
            <div className="h-48 bg-slate-50 relative overflow-hidden">
              {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-teal-50">
                  <Calendar size={64} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black uppercase text-[#044343] shadow-sm">
                  {event.date ? format(new Date(event.date), 'MMM dd') : 'TBD'}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-3 line-clamp-1">{event.title}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Clock size={14} className="text-teal-600" />
                  {event.date ? format(new Date(event.date), 'hh:mm a') : 'TBD'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <MapPin size={14} className="text-teal-600" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Users size={14} className="text-teal-600" />
                  {event.attendeesCount || 0} Participants
                </div>
              </div>
              <button className="mt-auto w-full py-3 bg-slate-50 text-[#044343] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#044343] hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                View Details
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community Events</h1>
          <p className="text-slate-500 font-medium">Join our upcoming workshops, book readings, and seminars.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-900/10 active:scale-95 transition-all">
          <Plus size={18} />
          Schedule Event
        </button>
      </div>

      {renderContent()}

      {/* Schedule Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">Schedule Event</h2>
            <form onSubmit={handleSubmit(onAddEvent)} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                <input {...register('title')} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input {...register('date')} type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                  <input {...register('time')} type="time" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input {...register('location')} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Participants</label>
                <input {...register('maxParticipants')} type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
              </div>
              <button type="submit" className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-teal-900/10 active:scale-95 transition-all">
                Publish Event
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventList;
