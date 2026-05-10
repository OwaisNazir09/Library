import React from 'react';
import { useGetEventsQuery, useAddEventMutation, useDeleteEventMutation } from '../../store/api/eventsApi';
import {
  Calendar as CalendarIcon,
  MapPin,
  Plus,
  Clock,
  ChevronRight,
  X,
  ChevronLeft,
  CalendarDays,
  MoreVertical,
  ImagePlus,
  Loader2,
  Trash2
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
  const [deleteEventMutation] = useDeleteEventMutation();

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
    } catch (err) { }
  };

  const handleDeleteEvent = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this event permanently?')) {
      try {
        await deleteEventMutation(id).unwrap();
        toast.success('Event removed');
      } catch (err) { }
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day) => {
    if (!items) return [];
    return items.filter(event => isSameDay(parseISO(event.eventDate || event.date), day));
  };

  const upcomingEvents = items
    ? [...items]
      .filter(event => parseISO(event.eventDate || event.date) >= new Date())
      .sort((a, b) => parseISO(a.eventDate || a.date) - parseISO(b.eventDate || b.date))
      .slice(0, 5)
    : [];

  const selectedDayEvents = getDayEvents(selectedDate);

  if (loading && items.length === 0) return <div className="p-6"><LoadingSkeleton type="table" rows={10} /></div>;
  if (error) return <ErrorState message="Error loading events" onRetry={refetch} />;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Events Calendar</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and track library activities</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-md">
          <Plus size={16} />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Card */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card p-0 overflow-hidden shadow-sm border-slate-200">
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
                <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:text-[#044343] rounded-md transition-all text-slate-400">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#044343] hover:bg-white rounded-md transition-all">
                  Today
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:text-[#044343] rounded-md transition-all text-slate-400">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-l border-t border-slate-50">
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
                      min-h-[100px] p-2.5 border-r border-b border-slate-50 cursor-pointer transition-all relative
                      ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white hover:bg-slate-50/50'}
                      ${isSelected ? 'bg-teal-50/50 ring-1 ring-inset ring-teal-200' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`
                        text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg
                        ${isTodayDate ? 'bg-[#044343] text-white shadow-md' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div key={idx} className="text-[9px] font-bold bg-teal-50 text-[#044343] px-2 py-1 rounded-md truncate border border-teal-100">
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[9px] font-bold text-slate-400 pl-1">+ {dayEvents.length - 2}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Events for {format(selectedDate, 'MMM dd')}</h3>
              <CalendarDays size={14} className="text-slate-300" />
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[12px] font-medium text-slate-400 italic">No activities scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((event, i) => (
                  <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} key={event._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 group">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">{event.title}</h4>
                      <button onClick={(e) => handleDeleteEvent(event._id, e)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <Clock size={12} className="text-teal-600" />
                        <span>{event.time || format(parseISO(event.eventDate || event.date), 'hh:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <MapPin size={12} className="text-teal-600" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-5">Upcoming Highlights</h3>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event._id} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-teal-50 group-hover:border-teal-100 transition-all">
                    <span className="text-[13px] font-bold text-slate-900 leading-none mb-0.5">{format(parseISO(event.eventDate || event.date), 'dd')}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{format(parseISO(event.eventDate || event.date), 'MMM')}</span>
                  </div>
                  <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-0 group-last:pb-0">
                    <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-[#044343] transition-colors line-clamp-1 mb-1">{event.title}</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-teal-500" /> {event.location}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-center text-[11px] text-slate-300 py-4">No events found</p>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="modal-panel w-full max-w-lg">
              <div className="modal-h">
                <h2 className="text-sm font-bold">Schedule Event</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit(onAddEvent)} className="flex flex-col">
                <div className="modal-b space-y-4">
                  <div>
                    <label className="label">Event Banner</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" id="bannerImageInput" />
                      <label htmlFor="bannerImageInput" className="cursor-pointer block">
                        {bannerPreview ? (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                            <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <p className="text-white text-[10px] font-bold uppercase">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-lg border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                            <ImagePlus size={24} className="text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Banner</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Event Title *</label>
                    <input {...register('title')} required className="input" placeholder="Enter event name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">Date *</label>
                      <input {...register('date')} type="date" required className="input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Time</label>
                      <input {...register('time')} type="time" className="input" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label">Location *</label>
                    <input {...register('location')} required className="input" placeholder="e.g. Main Seminar Room" />
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md px-6">Cancel</button>
                  <button type="submit" disabled={isAdding} className="btn btn-primary btn-md px-8 shadow-lg shadow-teal-900/10">
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
