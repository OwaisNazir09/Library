import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetPlansQuery,
  useCreateTenantMutation
} from '../../store/api/adminApi';
import {
  Building2, User, MapPin, Package, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Globe, Clock,
  Smartphone, Mail, Shield, Zap, Sparkles, LayoutGrid,
  Database, Activity, MessageSquare, Settings, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const steps = [
  { id: 'library', title: 'Library Info', icon: Building2 },
  { id: 'owner', title: 'Owner Info', icon: User },
  { id: 'address', title: 'Address', icon: MapPin },
  { id: 'plan', title: 'Plan Assignment', icon: Package },
  { id: 'review', title: 'Review & Create', icon: CheckCircle2 },
];

const CreateLibrary = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: plansData, isLoading: loadingPlans } = useGetPlansQuery();
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const plans = plansData?.data?.plans || [];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      libraryType: 'Book Library',
      trialDays: 14,
      status: 'active',
      plan: 'Starter',
      country: 'India',
      limits: {
        maxBooks: 500,
        maxStudents: 300,
        maxStaff: 5
      },
      features: {
        digitalLibrary: false,
        finance: true,
        reports: true,
        studyDesks: true,
        circulation: true,
        bookManagement: true,
        students: true,
        blogs: false,
        dailyQuotes: false
      }
    }
  });

  const formData = watch();

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data) => {
    try {
      if (!data.libraryCode) {
        data.libraryCode = `LIB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }

      if (!data.password) {
        data.password = Math.random().toString(36).substring(2, 10);
      }

      await createTenant(data).unwrap();
      toast.success('Library ecosystem provisioned successfully!');
      navigate('/admin/libraries');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create library node');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label">Library Entity Name *</label>
                <input {...register('name', { required: true })} placeholder="e.g. Oxford Public Library" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Target Subdomain *</label>
                <div className="relative">
                  <input {...register('subdomain', { required: true })} placeholder="oxford-lib" className="input pr-24" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">.welib.app</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="label">Library Type</label>
                <select {...register('libraryType')} className="input font-bold">
                  <option>Study Library</option>
                  <option>Book Library</option>
                  <option>Digital Library</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="label">Library Code (Optional)</label>
                <input {...register('libraryCode')} placeholder="Auto-generated if empty" className="input" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="label">Description</label>
              <textarea {...register('description')} rows={3} placeholder="Tell us about the library..." className="input h-auto py-3" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label">Opening Time</label>
                <input {...register('openingTime')} type="time" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Closing Time</label>
                <input {...register('closingTime')} type="time" className="input" />
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label">Owner Full Name *</label>
                <input {...register('ownerName', { required: true })} placeholder="John Doe" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Owner Email (Authority Login) *</label>
                <input {...register('email', { required: true })} type="email" placeholder="admin@library.com" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Contact Phone *</label>
                <input {...register('phone', { required: true })} placeholder="+91 ..." className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">WhatsApp Number</label>
                <input {...register('whatsapp')} placeholder="+91 ..." className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Set Master Password</label>
                <input {...register('password')} type="password" placeholder="Leave empty for auto-generation" className="input" />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="label">Address Line 1</label>
                <input {...register('address')} placeholder="Street, Building..." className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">City</label>
                <input {...register('city')} placeholder="City Name" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">State</label>
                <input {...register('state')} placeholder="State Name" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Postal Code</label>
                <input {...register('pincode')} placeholder="000000" className="input" />
              </div>
              <div className="space-y-2">
                <label className="label">Country</label>
                <input {...register('country')} placeholder="India" className="input" />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPlans ? (
                <div className="col-span-full py-20 text-center"><Loader2 size={40} className="animate-spin inline-block text-[#044343]" /></div>
              ) : (
                <>
                  {plans.map((plan) => (
                    <div 
                      key={plan._id}
                      onClick={() => {
                        setValue('plan', plan.name);
                        setValue('subscriptionPlanId', plan._id);
                        setValue('limits', plan.limits || { maxBooks: 1000, maxStudents: 100, maxStaff: 5 });
                        setValue('features', plan.features || { finance: true, reports: true });
                      }}
                      className={`p-8 rounded-[32px] border-2 transition-all cursor-pointer relative overflow-hidden group ${formData.plan === plan.name ? 'border-[#044343] bg-teal-50/30 ring-4 ring-teal-500/10' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${formData.plan === plan.name ? 'bg-[#044343] text-white shadow-teal-900/10' : 'bg-slate-50 text-slate-400 shadow-slate-900/5'}`}>
                          <Zap size={28} />
                        </div>
                        {formData.plan === plan.name && <div className="w-6 h-6 rounded-full bg-[#044343] flex items-center justify-center text-white"><CheckCircle2 size={16} /></div>}
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 mb-8 uppercase tracking-tighter">{plan.description || 'Enterprise package for library growth.'}</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[12px] font-black text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={12} /></div>
                          {plan.limits?.maxBooks || 500} Books Limit
                        </div>
                        <div className="flex items-center gap-3 text-[12px] font-black text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={12} /></div>
                          {plan.limits?.maxStudents || 300} Students Limit
                        </div>
                      </div>
                      
                      <div className="mt-10 pt-6 border-t border-slate-100 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {plan.billingCycle}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <AnimatePresence>
              {formData.plan === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 p-8 bg-white border border-slate-100 rounded-[32px] space-y-10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Settings size={18} /></div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Custom Configuration Ledger</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Book Inventory</label>
                        <input type="number" {...register('limits.maxBooks')} className="input h-12 bg-slate-50 border-none font-bold" placeholder="500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Student Enrollment</label>
                        <input type="number" {...register('limits.maxStudents')} className="input h-12 bg-slate-50 border-none font-bold" placeholder="300" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Staff Seats</label>
                        <input type="number" {...register('limits.maxStaff')} className="input h-12 bg-slate-50 border-none font-bold" placeholder="5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['digitalLibrary', 'finance', 'reports', 'studyDesks', 'circulation', 'bookManagement', 'students', 'blogs', 'dailyQuotes'].map(feat => (
                        <label key={feat} className="group flex items-center justify-between p-4 border border-slate-50 rounded-2xl bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-slate-900 transition-colors">
                            {feat.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <div className="relative">
                            <input type="checkbox" {...register(`features.${feat}`)} className="sr-only peer" />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Clock size={12} /> Trial Lifecycle (Days)
                </label>
                <input {...register('trialDays')} type="number" className="input h-12 bg-slate-50 border-none font-bold" />
                <p className="text-[10px] text-slate-400 font-medium italic">Ecosystem will automatically transition to 'expired' status after this period.</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck size={12} /> Provisioning Authority
                </label>
                <select {...register('status')} className="input h-12 bg-slate-50 border-none font-black uppercase tracking-widest text-emerald-600">
                  <option value="active">Active Authority</option>
                  <option value="disabled">Suspended / Pending Review</option>
                </select>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Ecosystem will be immediately operational.</p>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-[#044343]/5 border border-[#044343]/10 p-8 rounded-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#044343] text-white flex items-center justify-center text-3xl font-black">
                  {formData.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{formData.name}</h3>
                  <p className="text-sm font-bold text-teal-600">{formData.subdomain}.welib.app</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Admin</p>
                  <p className="text-sm font-bold text-slate-700">{formData.ownerName}</p>
                  <p className="text-xs text-slate-500">{formData.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Library Code</p>
                  <p className="text-sm font-bold text-slate-700">{formData.libraryCode || 'Auto-generated'}</p>
                  <p className="text-xs text-slate-500">{formData.libraryType}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Plan</p>
                  <p className="text-sm font-bold text-[#044343] uppercase">{formData.plan}</p>
                  <p className="text-xs text-slate-500">{formData.trialDays} Days Trial</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white border border-slate-100 rounded-3xl space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory & Resource Limits</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500">Max Book Inventory</span>
                    <span className="text-xs font-black text-slate-900">{formData.limits?.maxBooks}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500">Student Enrollment Cap</span>
                    <span className="text-xs font-black text-slate-900">{formData.limits?.maxStudents}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-bold text-slate-500">Staff Access Seats</span>
                    <span className="text-xs font-black text-slate-900">{formData.limits?.maxStaff}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border border-slate-100 rounded-3xl space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Module Access</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.features || {}).filter(([_, enabled]) => enabled).map(([key]) => (
                    <div key={key} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-tight border border-emerald-100">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                  ))}
                  {Object.entries(formData.features || {}).filter(([_, enabled]) => !enabled).map(([key]) => (
                    <div key={key} className="px-3 py-1.5 bg-slate-50 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-tight border border-slate-100 line-through">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
              <Shield className="text-amber-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-amber-900">Infrastructure Provisioning Audit</p>
                <p className="text-xs text-amber-700 mt-1">Creating this library node will provision a dedicated database shard, seed the financial ledger, and dispatch master credentials via encrypted email.</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-slide-up pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Deploy New Ecosystem</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Onboard a new library into the Welib multi-tenant network.</p>
        </div>
        <button onClick={() => navigate('/admin/libraries')} className="btn btn-secondary px-6">Cancel</button>
      </div>

      <div className="relative flex items-center justify-between max-w-4xl mx-auto px-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${idx <= currentStep ? 'bg-[#044343] text-white shadow-lg shadow-teal-900/20' : 'bg-white text-slate-300 border-2 border-slate-100'}`}
            >
              <step.icon size={20} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${idx <= currentStep ? 'text-[#044343]' : 'text-slate-400'}`}>{step.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-white p-1 rounded-[40px] shadow-2xl">
        <div className="bg-white border border-slate-100 p-10 rounded-[36px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            <div className="flex items-center justify-between mt-12 pt-10 border-t border-slate-50">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn btn-secondary btn-md px-8 gap-2 disabled:opacity-0 transition-all"
              >
                <ChevronLeft size={18} /> Previous Step
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary btn-md px-10 gap-2 shadow-xl shadow-teal-900/20"
                >
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn btn-primary btn-md px-12 gap-2 shadow-xl shadow-teal-900/20 min-w-[240px]"
                >
                  {isCreating ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={18} /> Provision Ecosystem</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLibrary;
