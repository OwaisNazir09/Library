import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, MessageSquare, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50 rounded-full blur-[120px] -ml-64 -mb-64 opacity-40" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-teal-900/5 border border-slate-100">

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-[#044343] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-900/20">
                    <ShieldCheck className="text-white" size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Request Callback</h1>
                  <p className="text-slate-500 font-medium">Interested in our library management system? Let's connect.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                      <input
                        {...register('fullName', { required: 'Full name is required' })}
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        className={`w-full bg-slate-50 border ${errors.fullName ? 'border-red-300' : 'border-slate-100'} rounded-2xl py-3.5 pl-12 pr-6 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 focus:border-[#044343]/20 outline-none transition-all font-semibold text-slate-900`}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.fullName.message}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                      <input
                        {...register('phone', { required: 'Phone number is required' })}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-300' : 'border-slate-100'} rounded-2xl py-3.5 pl-12 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="alex@example.com"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Preferred Contact Time */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Contact Time</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                      <select
                        {...register('preferredContactTime')}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900 appearance-none"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>
                  </div>

                  {/* Message/Query */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message / Query *</label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                      <textarea
                        {...register('message', { required: 'Please enter your message' })}
                        rows="4"
                        placeholder="Tell us about your requirements..."
                        className={`w-full bg-slate-50 border ${errors.message ? 'border-red-300' : 'border-slate-100'} rounded-2xl py-3.5 pl-12 pr-6 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900`}
                      ></textarea>
                    </div>
                    {errors.message && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.message.message}</p>}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="md:col-span-2 w-full bg-[#044343] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/10 transition-all flex items-center justify-center gap-3 group mt-6 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Callback'}
                    {!isSubmitting && <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />}
                  </motion.button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                  <p className="text-slate-400 font-medium text-sm">
                    Already an admin?
                    <Link to="/login" className="text-[#044343] font-black ml-2 hover:underline underline-offset-8">Access Portal</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="text-green-600" size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Thank you!</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                  Our admin will contact you soon to discuss your requirements.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#044343] font-black hover:underline underline-offset-8"
                >
                  Send another request
                </button>
                <div className="mt-12">
                  <Link to="/" className="inline-flex items-center gap-2 bg-[#044343] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#033636] transition-colors">
                    Back to Home
                  </Link>
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
