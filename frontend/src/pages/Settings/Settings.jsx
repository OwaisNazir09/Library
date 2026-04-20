import React, { useState } from 'react';
import { 
  User, Bell, Shield, Palette, ChevronRight, 
  Camera, Lock, Globe, Moon, Sun, Save, Loader2 
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useUpdateUserMutation } from '../../store/api/usersApi';
import { useUpdatePasswordMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useSelector((state) => state.auth);
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updatePassword, { isLoading: isUpdatingPass }] = useUpdatePasswordMutation();
  const dispatch = useDispatch();

  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile Settings', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { id: 'security', icon: Shield, label: 'Security & Password', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { id: 'appearance', icon: Palette, label: 'Appearance', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const ProfileView = () => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        fullName: user?.fullName,
        email: user?.email,
        phone: user?.phone,
        addressLine1: user?.addressLine1
      }
    });

    const onUpdateProfile = async (data) => {
      try {
        const res = await updateUser({ id: user._id, data }).unwrap();
        dispatch(setCredentials({ ...user, ...res.data.user }));
        toast.success('Profile updated successfully');
      } catch (err) {}
    };

    return (
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
           <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-slate-300" />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-[#044343] transition-all">
                <Camera size={14} />
              </button>
           </div>
           <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{user?.role}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit(onUpdateProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div className="space-y-1.5">
              <label className="label">Full Name</label>
              <input {...register('fullName')} className="input" />
           </div>
           <div className="space-y-1.5">
              <label className="label">Email Address</label>
              <input {...register('email')} className="input opacity-60" disabled />
           </div>
           <div className="space-y-1.5">
              <label className="label">Phone Number</label>
              <input {...register('phone')} className="input" />
           </div>
           <div className="space-y-1.5 md:col-span-2">
              <label className="label">Address</label>
              <textarea {...register('addressLine1')} rows={2} className="input h-auto py-2 resize-none" />
           </div>
           <div className="md:col-span-2 pt-2">
              <button type="submit" disabled={isUpdatingUser} className="btn btn-primary btn-md px-8">
                {isUpdatingUser ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
              </button>
           </div>
        </form>
      </motion.div>
    );
  };

  const SecurityView = () => {
    const { register, handleSubmit, reset } = useForm();

    const onChangePassword = async (data) => {
      if (data.password !== data.confirmPassword) {
        return toast.error('Passwords do not match');
      }
      try {
        await updatePassword({ currentPassword: data.currentPassword, password: data.password }).unwrap();
        toast.success('Password changed successfully');
        reset();
      } catch (err) {}
    };

    return (
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-xl flex gap-3">
           <Lock size={18} className="text-amber-600 shrink-0" />
           <p className="text-[12.5px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
             Regularly updating your password improves your account security. Ensure your new password is at least 8 characters long.
           </p>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="max-w-md space-y-4">
           <div className="space-y-1.5">
              <label className="label">Current Password</label>
              <input {...register('currentPassword')} type="password" required className="input" />
           </div>
           <div className="space-y-1.5">
              <label className="label">New Password</label>
              <input {...register('password')} type="password" required className="input" />
           </div>
           <div className="space-y-1.5">
              <label className="label">Confirm New Password</label>
              <input {...register('confirmPassword')} type="password" required className="input" />
           </div>
           <div className="pt-2">
              <button type="submit" disabled={isUpdatingPass} className="btn btn-primary btn-md px-8">
                {isUpdatingPass ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
              </button>
           </div>
        </form>
      </motion.div>
    );
  };

  const AppearanceView = () => {
    const handleToggle = () => {
      const newDark = !isDark;
      setIsDark(newDark);
      if (newDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };

    return (
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  {isDark ? <Moon size={20} className="text-amber-500" /> : <Sun size={20} />}
               </div>
               <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dark Mode</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Adjust the interface for lower light environments.</p>
               </div>
            </div>
            <button 
              onClick={handleToggle}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 p-1 ${isDark ? 'bg-[#044343]' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => { setIsDark(false); document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }}
              className={`card p-5 flex flex-col items-center gap-3 cursor-pointer border-2 transition-all ${!isDark ? 'border-[#044343] shadow-md' : 'border-transparent hover:border-slate-200'}`}
            >
               <div className="w-full h-24 bg-slate-50 rounded-lg border border-slate-100" />
               <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Light Mode</p>
            </div>
            <div 
              onClick={() => { setIsDark(true); document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }}
              className={`card p-5 flex flex-col items-center gap-3 cursor-pointer border-2 transition-all ${isDark ? 'border-[#044343] shadow-md bg-slate-900' : 'border-transparent hover:border-slate-800'}`}
            >
               <div className="w-full h-24 bg-slate-900 rounded-lg border border-slate-800" />
               <p className="text-xs font-bold text-slate-100">Dark Mode</p>
            </div>
         </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Library Configuration</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-widest">Settings & Personalization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeTab === item.id ? item.bg + ' ' + item.color : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
              }`}>
                <item.icon size={16} />
              </div>
              <span className={`text-[13px] font-bold ${activeTab === item.id ? 'text-slate-900 dark:text-slate-100' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 card p-8 min-h-[500px]">
           <AnimatePresence mode="wait">
              {activeTab === 'profile' && <ProfileView key="profile" />}
              {activeTab === 'security' && <SecurityView key="security" />}
              {activeTab === 'appearance' && <AppearanceView key="appearance" />}
              {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                         <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Email Notifications</h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Receive library activity logs via email.</p>
                         </div>
                         <button className="w-10 h-5 rounded-full bg-[#044343] relative p-1">
                            <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                         </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                         <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Push Notifications</h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time alerts on your mobile device.</p>
                         </div>
                         <button className="w-10 h-5 rounded-full bg-[#044343] relative p-1">
                            <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                         </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                         <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">SMS Reminders</h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Overdue book alerts via SMS.</p>
                         </div>
                         <button className="w-10 h-5 rounded-full bg-slate-200 dark:bg-slate-800 relative p-1">
                            <div className="w-3 h-3 bg-white rounded-full translate-x-0" />
                         </button>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button className="btn btn-primary btn-sm px-6">Save Preferences</button>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
