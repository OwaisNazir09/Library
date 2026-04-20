import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLoginMutation } from '../../store/api/authApi';
import { Mail, Lock, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [login, { isLoading: loading }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      toast.success('Welcome back!');
      const { role } = response;
      if (role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 font-sans antialiased">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <div className="card p-10 md:p-12 shadow-sm border-slate-100 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-6">
            <img src="/appicon.png" alt="Welib" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Welcome Back</h1>
          <p className="text-[13px] text-slate-500 font-medium mb-8">Sign in to manage your library ecosystem</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="label uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input
                  {...register('email')}
                  required
                  type="email"
                  placeholder="name@welib.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="label uppercase tracking-widest">Password</label>
                <Link to="/recovery" className="text-[11px] text-[#044343] font-bold hover:underline uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#044343] transition-colors" size={16} />
                <input
                  {...register('password')}
                  required
                  type="password"
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn btn-primary w-full h-[42px] mt-4 rounded-lg shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50">
            <p className="text-slate-400 font-medium text-[13px]">
              New to the platform?
              <Link to="/query" className="text-[#044343] font-bold ml-1.5 hover:underline">Request Callback</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
