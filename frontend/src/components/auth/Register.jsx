import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Library, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50 rounded-full blur-[120px] -ml-64 -mb-64 opacity-40" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-teal-900/5 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#044343] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-900/20">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Expand Your Network</h1>
            <p className="text-slate-500 font-medium">Deploy a new library instance in seconds.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrator Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                <input 
                  {...register('fullName')}
                  type="text" 
                  placeholder="e.g. Alex Morgan" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 focus:border-[#044343]/20 outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="alex@library.com" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Subdomain</label>
              <div className="relative group">
                <Library className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                <input 
                  {...register('subdomain')}
                  type="text" 
                  placeholder="city-lib" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Identity</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="md:col-span-2 w-full bg-[#044343] text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/10 transition-all flex items-center justify-center gap-3 group mt-6"
            >
              Deploy Instance
              <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
            </motion.button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-medium text-sm">
              Operational already? 
              <Link to="/login" className="text-[#044343] font-black ml-2 hover:underline underline-offset-8">Access Portal</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
