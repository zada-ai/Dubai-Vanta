import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RiApps2Line, RiCloseLine, RiSearchLine, RiCheckLine } from 'react-icons/ri';

/**
 * Mobile-first category switcher for the shop page, built for stores with many categories:
 *  - a swipeable row of chips for quick switching
 *  - an "All categories" bottom sheet with search and thumbnails
 */
const CategoryChips = ({ categories, selected, onSelect }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState('');
  const activeChipRef = useRef(null);

  // Keep the active chip visible in the rail
  useEffect(() => {
    activeChipRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selected]);

  // Lock page scroll while the sheet is open
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  const visibleInSheet = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? categories.filter((c) => (c.name || '').toLowerCase().includes(term)) : categories;
  }, [categories, query]);

  const choose = (id) => {
    onSelect(id);
    setSheetOpen(false);
    setQuery('');
  };

  const chipClass = (active) =>
    `shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
    }`;


  return (
    <div className="w-full">
      {/* "All categories" button stays put; the chips scroll beside it */}
      <div className="flex items-center gap-2 py-1">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-primary-600 text-white cursor-pointer whitespace-nowrap"
          aria-label="Browse all categories"
        >
          <RiApps2Line className="w-4 h-4" />
          Categories
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar snap-x py-0.5">
        <button
          type="button"
          ref={selected === 'all' ? activeChipRef : null}
          onClick={() => onSelect('all')}
          className={chipClass(selected === 'all')}
        >
          All
        </button>

        {categories.map((cat) => {
          const active = selected === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              ref={active ? activeChipRef : null}
              onClick={() => onSelect(cat.id)}
              className={chipClass(active)}
            >
              {cat.name}
            </button>
          );
        })}
        </div>
      </div>

      {/* Bottom sheet with every category */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSheetOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All categories"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="text-left">
                <h3 className="text-base font-black text-slate-900 dark:text-white">All Categories</h3>
                <p className="text-[11px] text-slate-400">{categories.length} categories</p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {categories.length > 8 && (
              <div className="relative px-4 pb-2">
                <RiSearchLine className="absolute left-7 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div className="overflow-y-auto px-4 pb-6 pt-1 flex flex-col gap-1">
              {!query && (
                <SheetRow
                  name="All Products"
                  active={selected === 'all'}
                  onClick={() => choose('all')}
                />
              )}
              {visibleInSheet.map((cat) => (
                <SheetRow
                  key={cat.id}
                  name={cat.name}
                  image={cat.image}
                  active={selected === cat.id}
                  onClick={() => choose(cat.id)}
                />
              ))}
              {visibleInSheet.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No category matches "{query}".</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SheetRow = ({ name, image, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-2 rounded-2xl text-left cursor-pointer transition-colors ${
      active ? 'bg-primary-50 dark:bg-primary-950/30' : 'active:bg-slate-100 dark:active:bg-slate-800'
    }`}
  >
    <span className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-[10px] font-black uppercase text-white/40">
      {image ? <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" /> : (name || '').slice(0, 2)}
    </span>
    <span className="flex-1 min-w-0">
      <span className={`block text-sm font-bold truncate ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-slate-100'}`}>
        {name}
      </span>
    </span>
    {active && <RiCheckLine className="shrink-0 w-5 h-5 text-primary-600 dark:text-primary-400" />}
  </button>
);

export default CategoryChips;
