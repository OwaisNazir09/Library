import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    navigate('/login');
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
          <div className="text-center mb-10">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-6">
              <img src="/appicon.png" alt="Welib" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Provision New Node</h1>
            <p className="text-[13px] text-slate-500 font-medium">Deploy a new library instance on the platform in seconds.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="label uppercase tracking-widest">Administrator Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input 
                  {...register('fullName')}
                  type="text" 
                  placeholder="e.g. Alex Morgan" 
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label uppercase tracking-widest">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="alex@welib.com" 
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label uppercase tracking-widest">Desired Subdomain</label>
              <div className="relative group">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input 
                  {...register('subdomain')}
                  type="text" 
                  placeholder="city-lib" 
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label uppercase tracking-widest">Master Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••" 
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label uppercase tracking-widest">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input pl-10"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="md:col-span-2 btn btn-primary w-full h-[42px] mt-4 rounded-lg shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 group"
            >
              <span>Deploy Instance</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-medium text-[13px]">
              Operational already? 
              <Link to="/login" className="text-[#044343] font-bold ml-1.5 hover:underline">Access Portal</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
