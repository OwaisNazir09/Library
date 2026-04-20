import React from 'react';
import { useGetEventsQuery, useAddEventMutation } from '../../store/api/eventsApi';
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
  const { data: eventsData, isLoading: loading, error, refetch } = useGetEventsQuery();
  const [addEventMutation, { isLoading: isAdding }] = useAddEventMutation();

  const items = eventsData?.data?.events || eventsData?.data || [];

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

  const onAddEvent = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => { if (val) formData.append(key, val); });
      if (bannerFile) formData.append('bannerImage', bannerFile);

      await addEventMutation(formData).unwrap();
      toast.success('Event scheduled successfully!');
      setIsModalOpen(false);
      reset();
      setBannerPreview(null);
      setBannerFile(null);
    } catch (err) {
      // Handled globally
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
    return <ErrorState message={error.data?.message || 'Error loading events'} onRetry={refetch} />;
  }

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Events Calendar</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and schedule library activities</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-md"
        >
          <Plus size={16} />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-0 overflow-hidden">
            {/* Calendar Controls */}
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-[#044343]">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Schedule</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                <button
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-white hover:text-[#044343] rounded-md transition-all text-slate-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#044343] hover:bg-white rounded-md transition-all"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-white hover:text-[#044343] rounded-md transition-all text-slate-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0">
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
          <div className="card p-5 group">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Events for {format(selectedDate, 'MMM dd')}</h3>
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#044343] transition-colors cursor-pointer">
                <MoreVertical size={14} />
              </div>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <CalendarDays size={24} />
                </div>
                <p className="text-[12px] font-medium text-slate-500">No activities scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((event, i) => (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={event._id}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group/item overflow-hidden"
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
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Upcoming Highlights</h3>
            </div>
            <div className="space-y-5">
              {upcomingEvents.map((event, i) => (
                <div key={event._id} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center flex-shrink-0 min-w-[40px]">
                    <span className="text-[14px] font-bold text-slate-900 leading-none mb-1">{format(parseISO(event.eventDate || event.date), 'dd')}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{format(parseISO(event.eventDate || event.date), 'MMM')}</span>
                  </div>
                  <div className="flex-1 border-b border-slate-100 pb-4 group-last:border-0 group-last:pb-0">
                    <h4 className="text-[13px] font-medium text-slate-900 group-hover:text-[#044343] transition-colors line-clamp-1 mb-1">{event.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin size={12} /> {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Create Event Modal */}
      {/* Existing Create Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-panel w-full max-w-lg">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Schedule New Event</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onAddEvent)} className="flex flex-col overflow-hidden">
                <div className="modal-b space-y-4">
                  <div>
                    <label className="label">Event Banner Image</label>
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
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-[#044343]/20">
                            <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <p className="text-white text-[10px] font-bold uppercase">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-[#044343]/30 transition-colors">
                            <ImagePlus size={24} className="text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Upload banner</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Event Title</label>
                    <input {...register('title')} required className="input" placeholder="e.g. Annual Book Fair" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">Date</label>
                      <input {...register('date')} type="date" required className="input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Time</label>
                      <input {...register('time')} type="time" className="input" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Location</label>
                    <input {...register('location')} required className="input" placeholder="e.g. Main Hall" />
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="btn btn-primary btn-md min-w-[120px]"
                  >
                    {isAdding ? <Loader2 size={16} className="animate-spin" /> : 'Publish Event'}
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

export default EventList;
