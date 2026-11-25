import React, { useEffect, useId, useRef, useState } from 'react';
import { RiArrowDownSLine, RiCheckLine } from 'react-icons/ri';

/**
 * Responsive replacement for a native <select>.
 * The option list always matches the field's width (never spills off-screen on mobile),
 * long labels wrap, and it works with the keyboard (arrows, Enter, Escape, Home/End).
 *
 * onChange receives a select-like event: { target: { name, value } }, so existing
 * `handleChange(e)` handlers keep working unchanged.
 */
const SelectField = ({ name, value, options = [], onChange, icon: Icon, className = '', ariaLabel }) => {
  const items = options.map((o) => (typeof o === 'object' && o !== null ? o : { value: o, label: o }));
  const selectedIndex = items.findIndex((o) => o.value === value);
  const selectedLabel = selectedIndex >= 0 ? items[selectedIndex].label : value;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, selectedIndex));
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  // Close when clicking/tapping outside
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted option visible
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[activeIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = () => {
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  };

  const choose = (item) => {
    onChange?.({ target: { name, value: item.value } });
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(items[activeIndex]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full min-w-0 items-center gap-2 rounded-xl border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 transition-colors cursor-pointer ${
          open
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
        <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
        <RiArrowDownSLine
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xl shadow-slate-900/10"
        >
          {items.map((item, idx) => {
            const selected = item.value === value;
            const active = idx === activeIndex;
            return (
              <li
                key={String(item.value)}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActiveIndex(idx)}
                onClick={() => choose(item)}
                className={`flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 text-sm leading-snug break-words ${
                  active ? 'bg-primary-50 dark:bg-primary-950/50' : ''
                } ${selected ? 'font-semibold text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'}`}
              >
                <span className="min-w-0 flex-1">{item.label}</span>
                {selected && <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelectField;
