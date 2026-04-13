import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { Mail, Lock, ArrowRight, Library, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(login(data));
    if (login.fulfilled.match(resultAction)) {
      toast.success('Welcome back!');
      const { role } = resultAction.payload;
      if (role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } else {
      toast.error(resultAction.payload?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] p-6 font-sans">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px]"
      >
        <div className="bg-white p-10 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-teal-900/5 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-[#044343] rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-teal-900/20">
            <Library className="text-white" size={36} />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 font-medium mb-12">Login to manage your library ecosystem</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={18} />
                <input
                  {...register('email')}
                  required
                  type="email"
                  placeholder="name@library.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Password</label>
                <Link to="/recovery" className="text-[10px] text-[#044343] font-black hover:underline uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#044343] transition-colors" size={18} />
                <input
                  {...register('password')}
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:ring-2 focus:ring-[#044343]/5 outline-none transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-[#044343] text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/10 transition-all flex items-center justify-center gap-3 group mt-10 disabled:opacity-70 disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enter Portal'}
              {!loading && <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />}
            </motion.button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-50">
            <p className="text-slate-400 font-medium text-sm">
              New to the platform?
              <Link to="/query" className="text-[#044343] font-black ml-2 hover:underline">Request Callback</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
