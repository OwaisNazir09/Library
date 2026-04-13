import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, createEvent } from '../../store/slices/eventSlice';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Plus,
  Clock,
  ChevronRight,
  X,
  ChevronLeft,
  CalendarDays,
  MoreVertical,
  ImagePlus,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const EventList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.events);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [bannerPreview, setBannerPreview] = React.useState(null);
  const [bannerFile, setBannerFile] = React.useState(null);
  const { register, handleSubmit, reset } = useForm();

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const loadEvents = React.useCallback(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  React.useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onAddEvent = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => { if (val) formData.append(key, val); });
    if (bannerFile) formData.append('bannerImage', bannerFile);

    const result = await dispatch(createEvent(formData));
    if (createEvent.fulfilled.match(result)) {
      toast.success('Event scheduled successfully!');
      setIsModalOpen(false);
      reset();
      setBannerPreview(null);
      setBannerFile(null);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayEvents = (day) => {
    if (!items) return [];
    return items.filter(event => {
      const eventDate = parseISO(event.eventDate || event.date);
      return isSameDay(eventDate, day);
    });
  };

  const upcomingEvents = items
    ? [...items]
      .filter(event => parseISO(event.eventDate || event.date) >= new Date())
      .sort((a, b) => parseISO(a.eventDate || a.date) - parseISO(b.eventDate || b.date))
      .slice(0, 5)
    : [];

  const selectedDayEvents = getDayEvents(selectedDate);

  if (loading && items.length === 0) {
    return <LoadingSkeleton type="table" rows={10} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadEvents} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events Calendar</h1>
          <p className="text-slate-500 font-medium">Coordinate, manage and view all upcoming library activities.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-900/10 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left: Calendar (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
            {/* Calendar Controls */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#044343]">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Schedule</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-white hover:text-[#044343] rounded-xl transition-all text-slate-400"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#044343] hover:bg-white rounded-xl transition-all"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-white hover:text-[#044343] rounded-xl transition-all text-slate-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-slate-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dayEvents = getDayEvents(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[85px] p-2.5 border-r border-b border-slate-50 cursor-pointer transition-all relative group
                      ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white hover:bg-slate-50/50'}
                      ${isSelected ? 'bg-teal-50/50 ring-1 ring-inset ring-teal-200' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`
                        text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                        ${isTodayDate ? 'bg-[#044343] text-white shadow-lg shadow-teal-900/20' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className="text-[9px] font-black bg-teal-50 text-[#044343] px-2 py-1 rounded-md truncate border border-teal-100 border-l-4 border-l-[#044343]"
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] font-black text-slate-400 pl-1">
                          + {dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Events for {format(selectedDate, 'MMM dd')}</h3>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#044343] transition-colors cursor-pointer">
                <MoreVertical size={16} />
              </div>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <CalendarDays size={32} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No activities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((event, i) => (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={event._id}
                    className="bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all group/item overflow-hidden"
                  >
                    {event.bannerImage && (
                      <div className="h-24 w-full relative">
                        <img src={event.bannerImage} className="w-full h-full object-cover" alt={event.title} />
                      </div>
                    )}
                    <div className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#044343] group-hover/item:bg-[#044343] group-hover/item:text-white transition-colors">
                        <Clock size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 leading-tight mb-1 truncate">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          <span>{event.time || format(parseISO(event.eventDate || event.date), 'hh:mm a')}</span>
                          <span>•</span>
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Section */}
          <div>
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming Highlights</h3>
              <Plus size={14} className="text-[#044343] cursor-pointer" />
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, i) => (
                <div key={event._id} className="flex gap-4 group cursor-pointer px-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-xs font-black text-slate-900">{format(parseISO(event.eventDate || event.date), 'dd')}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{format(parseISO(event.eventDate || event.date), 'MMM')}</span>
                    <div className="w-px h-full bg-slate-100 mt-2 group-last:hidden" />
                  </div>
                  <div className="flex-1 pb-6">
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-[#044343] transition-colors line-clamp-1">{event.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight flex items-center gap-1.5">
                      <MapPin size={10} /> {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">Schedule Event</h2>
            <form onSubmit={handleSubmit(onAddEvent)} className="space-y-6">
              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Banner Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="bannerImageInput"
                  />
                  <label htmlFor="bannerImageInput" className="cursor-pointer block">
                    {bannerPreview ? (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-[#044343]/20">
                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-black">Click to Change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-[#044343]/30 transition-colors">
                        <ImagePlus size={28} className="text-slate-300" />
                        <p className="text-[11px] font-black text-slate-400">Upload banner image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
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
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-teal-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Publish Event'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventList;
