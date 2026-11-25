import React, { useMemo } from 'react';
import { 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiArrowLeftDoubleLine, 
  RiArrowRightDoubleLine 
} from 'react-icons/ri';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Compute smart windowed page numbers with ellipsis
  const pages = useMemo(() => {
    // If 7 or fewer pages, show all of them
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Near the beginning
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    // Near the end
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // In the middle
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-col items-center gap-2.5 py-6 sm:py-8 select-none max-w-full" aria-label="Pagination">
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap max-w-full">
        {/* First Page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          title="First Page"
          aria-label="First page"
        >
          <RiArrowLeftDoubleLine className="w-4 h-4" />
        </button>

        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          aria-label="Previous page"
          title="Previous Page"
        >
          <RiArrowLeftSLine className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Page buttons and ellipsis */}
        {pages.map((item, idx) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 sm:w-8 text-center text-slate-400 dark:text-slate-500 font-black tracking-widest text-xs select-none"
              >
                •••
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = pageNum === currentPage;

          return (
            <button
              type="button"
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm scale-105'
                  : 'bg-white border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          aria-label="Next page"
          title="Next Page"
        >
          <RiArrowRightSLine className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Last Page button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          title="Last Page"
          aria-label="Last page"
        >
          <RiArrowRightDoubleLine className="w-4 h-4" />
        </button>
      </div>

      {/* Page indicator text */}
      <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">
        Page <span className="font-bold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
        <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span>
      </p>
    </nav>
  );
};

export default Pagination;
