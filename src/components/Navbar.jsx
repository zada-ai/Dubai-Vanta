import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories as defaultCategories } from '../data/mockData';
import { 
  RiShoppingBagLine, 
  RiHeartLine, 
  RiUser3Line, 
  RiSunLine, 
  RiMoonLine, 
  RiMenuLine, 
  RiCloseLine, 
  RiSearchLine,
  RiFileList3Line,
  RiLogoutBoxRLine,
  RiArrowDownSLine,
  RiShieldCheckLine,
  RiGridFill
} from 'react-icons/ri';

const Navbar = () => {
  const { 
    darkMode, 
    setDarkMode, 
    getCartCount, 
    wishlist, 
    user, 
    logout,
    storeLogo,
    storeName,
    categories: appCategories
  } = useApp();
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const categories = (appCategories && appCategories.length > 0) ? appCategories : defaultCategories;

  // Reset logo error when storeLogo changes
  useEffect(() => {
    setLogoError(false);
  }, [storeLogo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (searchCategory && searchCategory !== 'all') {
      params.set('category', searchCategory);
    }
    const qs = params.toString();
    navigate(qs ? `/shop?${qs}` : '/shop');
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  const cartCount = getCartCount();
  const wishlistCount = wishlist.length;

  // Resolve logo path ensuring /storage/ link compatibility
  const resolvedLogo = storeLogo 
    ? (storeLogo.startsWith('/uploads/') ? storeLogo.replace('/uploads/', '/storage/') : storeLogo) 
    : null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              {resolvedLogo && !logoError ? (
                <img
                  src={resolvedLogo}
                  alt={storeName || "Store Logo"}
                  onError={() => setLogoError(true)}
                  className="h-8 max-h-8 w-auto max-w-[120px] sm:max-w-[150px] object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center font-black text-white dark:text-slate-950 text-base shadow-sm group-hover:scale-105 transition-transform">
                    {(storeName || 'A').charAt(0).toUpperCase()}
                  </span>
                  <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-white uppercase truncate max-w-[120px] sm:max-w-none">
                    {storeName || 'AEROSTORE'}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Search Bar with Category Selector (Prominently visible on Desktop & Tablets) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md xl:max-w-xl mx-2 lg:mx-4"
          >
            <div className="flex items-center w-full h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all overflow-hidden shadow-xs">
              
              {/* Category Select Dropdown in Search Bar */}
              <div className="relative shrink-0 border-r border-slate-200 dark:border-slate-800 h-full flex items-center">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: 'none'
                  }}
                  className="h-full pl-3 pr-6 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors focus:outline-hidden cursor-pointer max-w-[120px] lg:max-w-[140px] truncate leading-10 py-0"
                  aria-label="Filter category"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <RiArrowDownSLine className="absolute right-1.5 text-slate-400 pointer-events-none w-3.5 h-3.5" />
              </div>

              {/* Search Input Field */}
              <div className="relative flex-1 flex items-center h-full">
                <RiSearchLine className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products, brands, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-9 pr-3 text-xs sm:text-sm bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-medium"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-4 h-full bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Search"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <Link to="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Shop
            </Link>

            {/* Categories Dropdown Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1 cursor-pointer font-semibold"
              >
                <RiGridFill className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Categories</span>
                <RiArrowDownSLine className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180 text-primary-600' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-64 z-50 animate-fade-in">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 overflow-hidden">
                    <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">All Categories</span>
                      <Link 
                        to="/shop" 
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto">
                      <Link
                        to="/shop"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>All Products</span>
                        <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">Catalog</span>
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${encodeURIComponent(cat.id)}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="truncate">{cat.name}</span>
                          {cat.count ? (
                            <span className="text-[10px] font-mono text-slate-400">{cat.count}</span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Contact
            </Link>
            <Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              FAQ
            </Link>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Link 
                to="/admin" 
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 text-xs ${
                  user?.role === 'superadmin'
                    ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-xs hover:bg-purple-500/30'
                    : 'bg-primary-500/15 text-primary-600 dark:text-primary-400 hover:bg-primary-500/25'
                }`}
              >
                <RiShieldCheckLine className="w-3.5 h-3.5" />
                {user?.role === 'superadmin' ? '⚡ Super Admin' : 'Admin Panel'}
              </Link>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {darkMode ? <RiSunLine className="w-5 h-5" /> : <RiMoonLine className="w-5 h-5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
              aria-label="Wishlist"
            >
              <RiHeartLine className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center leading-none shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
              aria-label="Cart"
            >
              <RiShoppingBagLine className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-[9px] flex items-center justify-center leading-none shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  aria-label="User account menu"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                  />
                  <RiArrowDownSLine className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10 cursor-default" 
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-20">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{user.name}</p>
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <span className={`inline-block mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                            user.role === 'superadmin'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {user.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                          </span>
                        )}
                      </div>
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/40"
                        >
                          <RiShieldCheckLine className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <RiUser3Line className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <RiFileList3Line className="w-4 h-4 text-slate-400" />
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                      >
                        <RiLogoutBoxRLine className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Login"
              >
                <RiUser3Line className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all md:hidden cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <RiCloseLine className="w-6 h-6" /> : <RiMenuLine className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar (Always visible on mobile screens) */}
      <div className="md:hidden px-3 pb-2.5 pt-0.5">
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
          <div className="flex items-center w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all overflow-hidden shadow-2xs">
            <div className="relative shrink-0 border-r border-slate-200 dark:border-slate-800 h-full flex items-center">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none'
                }}
                className="h-full pl-2.5 pr-6 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-transparent focus:outline-hidden cursor-pointer max-w-[95px] truncate leading-9 py-0"
                aria-label="Filter category"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <RiArrowDownSLine className="absolute right-1 text-slate-400 pointer-events-none w-3 h-3" />
            </div>
            <div className="relative flex-1 flex items-center h-full">
              <RiSearchLine className="absolute left-2.5 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full pl-8 pr-2 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-3 h-full bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Search"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-[108px] bg-black/60 backdrop-blur-xs z-30 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-[108px] inset-x-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl py-6 px-5 flex flex-col gap-5 z-40 md:hidden animate-fade-in max-h-[calc(100vh-6.75rem)] overflow-y-auto">
            
            {/* Mobile Search with Category Selector */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  <RiSearchLine className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs"
              >
                Search Products
              </button>
            </form>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1 font-semibold text-slate-700 dark:text-slate-200">
              <Link 
                to="/shop" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <span>Shop All Products</span>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">Catalog</span>
              </Link>

              {/* Mobile Categories Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCatOpen(!mobileCatOpen)}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <RiGridFill className="w-4 h-4 text-primary-600" />
                    Categories
                  </span>
                  <RiArrowDownSLine className={`w-4 h-4 transition-transform ${mobileCatOpen ? 'rotate-180 text-primary-600' : ''}`} />
                </button>
                {mobileCatOpen && (
                  <div className="pl-6 pr-2 py-1 flex flex-col gap-1 border-l-2 border-primary-500/30 ml-3 mt-1">
                    <Link
                      to="/shop"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400"
                    >
                      All Categories
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${encodeURIComponent(cat.id)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-primary-600 flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        {cat.count ? <span className="font-mono text-[10px] text-slate-400">{cat.count}</span> : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                to="/faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                FAQ
              </Link>
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 flex items-center gap-2 font-bold"
                >
                  <RiShieldCheckLine className="w-4 h-4" />
                  {user?.role === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Panel'}
                </Link>
              )}
            </div>

            {/* Mobile User Profile info */}
            {user ? (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</h5>
                    <p className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    aria-label="Profile"
                  >
                    <RiUser3Line className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 cursor-pointer"
                    aria-label="Logout"
                  >
                    <RiLogoutBoxRLine className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-950 transition-colors shadow-sm"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;