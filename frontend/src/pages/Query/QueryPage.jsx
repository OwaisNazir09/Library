import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, MessageSquare, Clock, ArrowRight, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';
import queryService from '../../services/queryService';
import { toast } from 'react-hot-toast';

const QueryPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await queryService.submitQuery(data);
      setIsSubmitted(true);
      toast.success('Interest submitted successfully!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden font-sans antialiased">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="card p-10 md:p-12 shadow-sm border-slate-100">

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="text-center mb-10">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-6">
                    <img src="/appicon.png" alt="Welib" className="w-full h-full object-contain" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Request Callback</h1>
                  <p className="text-[13px] text-slate-500 font-medium">Interested in Welib? Let's connect and discuss your library's needs.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="label uppercase tracking-widest">Full Name *</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                      <input
                        {...register('fullName', { required: 'Full name is required' })}
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        className={`input pl-10 ${errors.fullName ? 'border-red-300' : ''}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="label uppercase tracking-widest">Phone Number *</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                      <input
                        {...register('phone', { required: 'Phone number is required' })}
                        type="tel"
                        placeholder="+91 (000) 000-0000"
                        className={`input pl-10 ${errors.phone ? 'border-red-300' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="label uppercase tracking-widest">Work Email (Optional)</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="alex@library.com"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="label uppercase tracking-widest">Preferred Contact Time</label>
                    <div className="relative group">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                      <select
                        {...register('preferredContactTime')}
                        className="input pl-10 pr-6 appearance-none font-bold"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="label uppercase tracking-widest">Message / Requirements *</label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-3 top-3 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                      <textarea
                        {...register('message', { required: 'Please enter your message' })}
                        rows="4"
                        placeholder="Tell us about your library or requirements..."
                        className={`input pl-10 h-auto py-2.5 min-h-[100px] resize-none ${errors.message ? 'border-red-300' : ''}`}
                      ></textarea>
                    </div>
                    {errors.message && <p className="text-red-500 text-[10px] mt-1">{errors.message.message}</p>}
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="md:col-span-2 btn btn-primary w-full h-[42px] mt-4 rounded-lg shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 group"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Request Callback'}</span>
                    {!isSubmitting && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />}
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                  <p className="text-slate-400 font-medium text-[13px]">
                    Already an admin?
                    <Link to="/login" className="text-[#044343] font-bold ml-1.5 hover:underline">Access Portal</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-emerald-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Interest Recorded</h2>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
                  Thank you for reaching out. Our team will contact you within 24 hours to discuss how Welib can help.
                </p>
                <div className="flex flex-col gap-4">
                  <Link to="/" className="btn btn-primary h-[42px] px-8 rounded-lg shadow-md font-bold">
                    Back to Home
                  </Link>
                  <button onClick={() => setIsSubmitted(false)} className="text-[12px] text-slate-400 font-bold hover:text-slate-600 uppercase tracking-widest">
                    Submit Another Request
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default QueryPage;
