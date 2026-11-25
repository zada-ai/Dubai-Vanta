import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RiSearchLine, 
  RiTimeLine, 
  RiCalendarLine, 
  RiUser3Line, 
  RiArrowRightLine, 
  RiBookOpenLine,
  RiPriceTag3Line,
  RiSparklingFill
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { DEFAULT_BLOGS } from '../data/defaultBlogs';

const Blogs = () => {
  const { darkMode } = useApp();
  const [blogs, setBlogs] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_blogs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_BLOGS;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;
    async function fetchBlogs() {
      try {
        setError(null);
        const res = await fetch('/api/blogs', { credentials: 'include' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        if (!text || !text.trim()) {
          throw new Error('Empty response');
        }
        let data;
        try {
          data = JSON.parse(text);
        } catch (_) {
          throw new Error('Invalid JSON');
        }

        if (data.success && isMounted && Array.isArray(data.blogs) && data.blogs.length > 0) {
          setBlogs(data.blogs);
          try {
            localStorage.setItem('cached_blogs', JSON.stringify(data.blogs));
          } catch (e) {}
        } else if (isMounted) {
          setBlogs((prev) => (prev && prev.length > 0 ? prev : DEFAULT_BLOGS));
        }
      } catch (err) {
        console.warn('Live blog fetch notice (using cache/defaults):', err.message);
        if (isMounted) {
          setBlogs((prev) => {
            if (prev && prev.length > 0) return prev;
            try {
              const cached = localStorage.getItem('cached_blogs');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
              }
            } catch (_) {}
            return DEFAULT_BLOGS;
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogs]);

  // Filtered blogs based on search query & category
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCat = selectedCategory === 'All' || blog.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;
      const matchesQuery = 
        blog.title?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.tags?.toLowerCase().includes(q) ||
        blog.author?.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Featured article is the first blog when no search is active
  const featuredBlog = useMemo(() => {
    if (searchQuery || selectedCategory !== 'All' || filteredBlogs.length === 0) return null;
    return filteredBlogs[0];
  }, [filteredBlogs, searchQuery, selectedCategory]);

  const listBlogs = useMemo(() => {
    if (featuredBlog && !searchQuery && selectedCategory === 'All') {
      return filteredBlogs.slice(1);
    }
    return filteredBlogs;
  }, [filteredBlogs, featuredBlog, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Editorial Header Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-14 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(36,111,99,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(36,111,99,0.25),rgba(2,6,23,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/60 text-primary-700 dark:text-primary-300 text-xs font-bold tracking-wide uppercase mb-5"
          >
            <RiSparklingFill className="w-3.5 h-3.5 text-primary-500" />
            The Vanta Dubai Journal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white max-w-4xl mx-auto leading-tight"
          >
            Stories of Sound, Craft & Contemporary Living
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Explore deep dives on acoustic architecture, minimalist lifestyle design, and next-generation smart living from our editorial team in Dubai.
          </motion.p>

          {/* Search Input Bar */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-8 max-w-xl mx-auto"
          >
            <div className="relative flex items-center">
              <RiSearchLine className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles by title, topic, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-medium placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center">
            <div className="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-500">Loading journal articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center max-w-lg mx-auto">
            <p className="text-rose-600 dark:text-rose-400 font-bold mb-2">Unable to load blogs</p>
            <p className="text-xs text-rose-500 dark:text-rose-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Featured Blog Spotlight (Hero) */}
        {!loading && !error && featuredBlog && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary-600 dark:text-primary-400">
                Featured Cover Story
              </h2>
            </div>

            <Link
              to={`/blog/${featuredBlog.slug || featuredBlog.id}`}
              className="group block relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[420px] overflow-hidden bg-slate-900">
                  <img
                    src={featuredBlog.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200'}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                      {featuredBlog.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <RiCalendarLine className="w-3.5 h-3.5" />
                        {new Date(featuredBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <RiTimeLine className="w-3.5 h-3.5" />
                        {featuredBlog.read_time || '5 min read'}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight mb-4">
                      {featuredBlog.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 font-normal leading-relaxed">
                      {featuredBlog.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-black text-xs flex items-center justify-center">
                        {(featuredBlog.author || 'A').charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {featuredBlog.author || 'Vanta Dubai Editorial'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                      See More <RiArrowRightLine className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Blog Cards Grid */}
        {!loading && !error && (
          <div>
            {listBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {listBlogs.map((blog, idx) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/blog/${blog.slug || blog.id}`}
                      className="group flex flex-col h-full rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-900">
                        <img
                          src={blog.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-white border border-white/20">
                            {blog.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-slate-200 flex items-center gap-1">
                            <RiTimeLine className="w-3 h-3" />
                            {blog.read_time || '5 min read'}
                          </span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
                            <RiCalendarLine className="w-3.5 h-3.5" />
                            <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <h3 className="text-lg font-black text-slate-950 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug mb-2 line-clamp-2">
                            {blog.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {blog.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                            {blog.author || 'Vanta Dubai'}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                            See More <RiArrowRightLine className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <RiBookOpenLine className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No articles found</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  {searchQuery ? `No articles matched "${searchQuery}". Try different search keywords.` : 'No published articles in this category yet.'}
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:scale-105 transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Newsletter CTA Box */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md mb-4 inline-block">
              Stay Informed
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3">
              Subscribe to The Vanta Dubai Journal
            </h2>
            <p className="text-sm sm:text-base text-primary-100 mb-6 font-medium">
              Curated perspectives on luxury design, high-fidelity sound, and architectural minimalism delivered to your inbox monthly.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-primary-200 text-sm focus:outline-hidden focus:bg-white/20 flex-1 font-medium"
              />
              <button
                type="button"
                onClick={() => alert('Thank you for subscribing to The Vanta Dubai Journal!')}
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-primary-50 transition cursor-pointer shadow-md"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Blogs;
