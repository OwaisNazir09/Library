import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ErrorState = ({ message, onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-rose-50 rounded-[2.5rem] border border-rose-100"
    >
      <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-black text-rose-900 mb-2 tracking-tight">System Interruption</h3>
      <p className="text-rose-600/70 font-medium mb-8 max-w-[300px]">
        {message || "We encountered an unexpected error while retrieving data."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-3 bg-rose-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-rose-900/10 hover:bg-rose-700 active:scale-95 transition-all"
        >
          <RefreshCw size={18} />
          Retry Connection
        </button>
      )}
    </motion.div>
  );
};

export default ErrorState;
