import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ total, limit = 10, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-50">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-black text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-black text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">
            Showing <span className="font-black text-slate-900">{(currentPage - 1) * limit + 1}</span> to <span className="font-black text-slate-900">{Math.min(currentPage * limit, total)}</span> of <span className="font-black text-slate-900">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-2" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 text-slate-400 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 focus:z-20 disabled:opacity-50 transition-all"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft size={20} />
            </button>
            
            {pages.map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-xs font-black text-slate-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-xs font-black rounded-xl transition-all ${
                    currentPage === page
                      ? 'z-10 bg-[#044343] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 shadow-lg shadow-teal-900/10'
                      : 'text-slate-900 bg-white border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 text-slate-400 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 focus:z-20 disabled:opacity-50 transition-all"
            >
              <span className="sr-only">Next</span>
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
