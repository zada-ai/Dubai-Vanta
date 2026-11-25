import React, { useMemo } from 'react';
import SelectField from './SelectField';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories as defaultCategories } from '../data/mockData';
import RatingComponent from './RatingComponent';
import { RiCloseLine, RiFilterLine, RiRefreshLine, RiSearchLine } from 'react-icons/ri';

const FilterSidebar = ({ filters, setFilters, onClose, onCategorySelect, onSearchChange }) => {
  const { categories: appCategories, productsList } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategories = (appCategories && appCategories.length > 0) ? appCategories : defaultCategories;
  const categoryCounts = useMemo(() => {
    const counts = {};
    (productsList || []).forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [productsList]);

  const categories = useMemo(() => {
    return rawCategories.filter(c => c && !['groceries', 'sneakers', 'gaming-vr'].includes(c.id) && (categoryCounts[c.id] > 0 || Number(c.count) > 0));
  }, [rawCategories, categoryCounts]);

  const handleCategoryChange = (catId) => {
    const nextCat = filters.category === catId ? 'all' : catId;
    if (onCategorySelect) {
      onCategorySelect(nextCat);
    } else {
      setFilters((prev) => ({
        ...prev,
        category: nextCat,
        page: 1
      }));
      const newParams = new URLSearchParams(searchParams);
      if (nextCat === 'all') {
        newParams.delete('category');
      } else {
        newParams.set('category', nextCat);
      }
      setSearchParams(newParams);
    }
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(e);
    } else {
      setFilters((prev) => ({ ...prev, search: val, page: 1 }));
      const newParams = new URLSearchParams(searchParams);
      if (val) {
        newParams.set('search', val);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [name]: value === '' ? '' : Number(value)
      },
      page: 1
    }));
  };

  const handleRatingChange = (rating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating,
      page: 1
    }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: e.target.value,
      page: 1
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priceRange: { min: 0, max: '' },
      rating: 0,
      sortBy: 'latest',
      page: 1
    });
    setSearchParams({});
  };

  return (
    <div className="flex flex-col gap-6 w-full p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-xs">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <RiFilterLine className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
            title="Reset Filters"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Products</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search keywords..."
            value={filters.search || ''}
            onChange={handleSearchInputChange}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
          <RiSearchLine className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Sorting options */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort By</label>
        <SelectField
          value={filters.sortBy}
          onChange={handleSortChange}
          ariaLabel="Sort products"
          options={[
            { value: 'latest', label: 'Latest Arrivals' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'popular', label: 'Popularity' },
          ]}
        />
      </div>

      {/* Categories filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
        <div className="flex flex-col gap-1.5 mt-1 max-h-80 overflow-y-auto pr-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all', page: 1 }))}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
              filters.category === 'all'
                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                filters.category === cat.id
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="shrink-0 ml-2 text-[11px] font-semibold text-slate-400">{categoryCounts[cat.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range (AED)</label>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1">
            <span className="text-[10px] text-slate-400">Min Price</span>
            <input
              type="number"
              name="min"
              value={filters.priceRange.min}
              onChange={handlePriceChange}
              placeholder="0"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <span className="text-slate-400 font-bold mt-4">-</span>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400">Max Price</span>
            <input
              type="number"
              name="max"
              value={filters.priceRange.max}
              onChange={handlePriceChange}
              placeholder="Any"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Rating filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Rating</label>
        <div className="flex flex-col gap-1 mt-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => handleRatingChange(stars)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                filters.rating === stars
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              <RatingComponent rating={stars} size={12} />
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
