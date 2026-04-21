import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, MessageSquare, ArrowRight, X } from 'lucide-react';

const LockedFeature = ({ 
  featureName = "Premium Feature", 
  description = "This module is not included in your current plan. Upgrade to unlock advanced capabilities.",
  icon: Icon = Lock,
  isModal = false,
  onClose
}) => {
  const navigate = useNavigate();

  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`max-w-xl w-full bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 relative ${isModal ? 'z-50' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="p-12 text-center relative z-10">
        {isModal && (
          <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl">
            <X size={20} />
          </button>
        )}

        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-900/20">
          <Icon size={40} className="text-white" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-100">
          <Zap size={12} fill="currentColor" />
          Plan Upgrade Required
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
          {featureName} Locked
        </h2>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button 
            onClick={() => navigate('/app/packages')}
            className="w-full sm:w-auto px-8 py-4 bg-[#044343] text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-900/20 hover:bg-[#033232] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Plans</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/app/support')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Contact Sales</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-6 border-t border-slate-100">
        <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-200" />
            <div className="w-12 h-2 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-200" />
            <div className="w-12 h-2 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
        <AnimatePresence>
          {content}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      {content}
    </div>
  );
};

export default LockedFeature;
