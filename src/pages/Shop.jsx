import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products as initialProducts, categories as initialCategories } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import CategoryChips from '../components/CategoryChips';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Breadcrumb from '../components/Breadcrumb';
import { RiSearchLine, RiFilterLine } from 'react-icons/ri';

const Shop = () => {
  const { productsList, categories: appCategories } = useApp();
  const products = productsList || [];
  const rawCategories = (appCategories && appCategories.length > 0) ? appCategories : initialCategories;
  const categories = useMemo(() => {
    return rawCategories.filter(c => c && !['groceries', 'sneakers', 'gaming-vr'].includes(c.id) && (c.count === undefined || Number(c.count) > 0));
  }, [rawCategories]);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParam,
    category: categoryParam,
    priceRange: { min: 0, max: '' },
    rating: 0,
    sortBy: 'latest',
    page: 1
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category and search query from URL search parameters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryParam,
      search: searchParam,
      page: 1
    }));
  }, [categoryParam, searchParam]);

  // Real number of products in each category
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const activeCategory = categories.find((c) => c.id === filters.category) || null;

  // Switch category from the mobile chips / category sheet (keeps the URL shareable)
  const handleCategorySelect = (catId) => {
    setFilters((prev) => ({ ...prev, category: catId, page: 1 }));
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
    
    // Update URL query parameter
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Filter and sort items
  const filteredProducts = products
    .filter((product) => {
      // 1. Search Query Filter (matches Name, Brand, SKU, UUID)
      const term = (filters.search || '').toLowerCase();
      const matchSearch = 
        !term || 
        product.name.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term)) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        (product.id && String(product.id).toLowerCase().includes(term));
      
      // 2. Category Filter
      const matchCategory = filters.category === 'all' || product.category === filters.category;
      
      // 3. Price Filter
      const activePrice = product.discountPrice || product.price;
      // An empty min / max box means "no limit" on that side
      const { min, max } = filters.priceRange;
      const matchPrice =
        (min === '' || min === null || activePrice >= Number(min)) &&
        (max === '' || max === null || activePrice <= Number(max));
      
      // 4. Rating Filter
      // Products without reviews yet still show unless a rating filter is active
      const matchRating = !filters.rating || (product.rating || 0) >= filters.rating;

      return matchSearch && matchCategory && matchPrice && matchRating;
    })
    .sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      switch (filters.sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'popular':
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        case 'latest':
        default:
          return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
      }
    });

  // Pagination calculations
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (filters.page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Page Breadcrumb */}
      <Breadcrumb items={[{ name: 'Shop', path: '/shop' }]} />

      {/* Premium Shop Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-28 sm:h-44 md:h-56 flex items-center bg-slate-900 text-white sm:mb-4">
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80" 
          alt="Premium store catalog collections" 
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 text-left">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-1 sm:mb-2 line-clamp-1">
            {activeCategory ? activeCategory.name : 'Our Catalog'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-md font-medium leading-relaxed line-clamp-2">
            {activeCategory
              ? activeCategory.description || `Browse all ${categoryCounts[activeCategory.id] || 0} products in ${activeCategory.name}.`
              : 'Browse and discover our handpicked collection of premium design products.'}
          </p>
        </div>
      </div>

      {/* Mobile & tablet category switcher (desktop uses the sidebar) */}
      <CategoryChips
        categories={categories}
        counts={categoryCounts}
        totalCount={products.length}
        selected={filters.category}
        onSelect={handleCategorySelect}
      />

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-5">
        <div className="text-left">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            {activeCategory ? ` in ${activeCategory.name}` : ''}
          </p>
        </div>

        {/* Search Input, Category Selector and Filter Trigger */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Category Dropdown (All Screens) */}
          <select
            value={filters.category}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-xs max-w-[140px] sm:max-w-none truncate"
            aria-label="Filter by Category"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({categoryCounts[cat.id] || 0})
              </option>
            ))}
          </select>

          {/* Live Search Field */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <input
              type="text"
              placeholder="Search in catalog..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-white shadow-xs"
            />
            <RiSearchLine className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          </div>

          {/* Mobile Filter Button (only visible on mobile screens < 768px) */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 cursor-pointer"
          >
            <RiFilterLine className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Two Column Grid: Left Sidebar on md (768px)+ screens, Product Grid on right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 mt-4">
        {/* Left Filter Sidebar */}
        <aside className="hidden md:block md:col-span-1 shop-filter-sidebar self-start sticky top-24">
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            onCategorySelect={handleCategorySelect}
            onSearchChange={handleSearchChange}
          />
        </aside>

        {/* Product Grid and Pagination */}
        <main className="md:col-span-3 flex flex-col gap-6">
          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-8">
              <EmptyState
                type="search"
                title="No items match your filters"
                message="Try adjusting your keywords, widening your price range, or selecting a different category to view more products."
                buttonText="Reset All Filters"
                buttonLink="#"
                onClick={() => {
                  setFilters({
                    search: '',
                    category: 'all',
                    priceRange: { min: 0, max: '' },
                    rating: 0,
                    sortBy: 'latest',
                    page: 1
                  });
                  setSearchParams({});
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Slide-Over (mobile screens < 768px) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-900 p-4 shadow-xl z-10 overflow-y-auto flex flex-col animate-slide-in">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              onClose={() => setMobileFiltersOpen(false)} 
              onCategorySelect={(cat) => {
                handleCategorySelect(cat);
                setMobileFiltersOpen(false);
              }}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
