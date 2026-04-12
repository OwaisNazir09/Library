import React from 'react';
import { Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({ title, message, actionLabel, onAction, icon: Icon = Search }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-16 text-center bg-slate-50 rounded-[3.5rem] border border-dashed border-slate-200"
    >
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 text-slate-300 shadow-sm">
        <Icon size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title || "No Results Found"}</h3>
      <p className="text-slate-400 font-medium mb-10 max-w-[340px]">
        {message || "We couldn't find any records matching your current criteria or the library inventory."}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-3 bg-[#044343] text-white font-black px-10 py-5 rounded-3xl shadow-2xl shadow-teal-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          {actionLabel || "Add New Record"}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
