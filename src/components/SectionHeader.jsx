import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightLine } from 'react-icons/ri';

/**
 * Shared header for home page sections so every block has the same rhythm:
 * small eyebrow label, strong title, muted subtitle, and an optional action on the right.
 */
const SectionHeader = ({ eyebrow, title, subtitle, actionLabel, actionTo, onAction, children }) => {
  const actionClass =
    'group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer';

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0 text-left">
        {eyebrow && (
          <p className="mb-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {children}
        {actionLabel && actionTo && (
          <Link to={actionTo} className={actionClass}>
            <span>{actionLabel}</span>
            <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
        {actionLabel && !actionTo && onAction && (
          <button type="button" onClick={onAction} className={actionClass}>
            <span>{actionLabel}</span>
            <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
