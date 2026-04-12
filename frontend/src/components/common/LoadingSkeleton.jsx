import React from 'react';

const LoadingSkeleton = ({ type = 'table', rows = 5 }) => {
  if (type === 'table') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-slate-100 rounded-2xl w-full" />
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center p-4 border-b border-slate-50">
            <div className="w-12 h-12 bg-slate-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-3 bg-slate-100/60 rounded w-1/2" />
            </div>
            <div className="w-20 h-8 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
            <div className="h-6 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100/60 rounded w-full" />
            <div className="h-10 bg-slate-50 rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  return <div className="animate-spin w-8 h-8 border-4 border-[#044343] border-t-transparent rounded-full mx-auto" />;
};

export default LoadingSkeleton;
