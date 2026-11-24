import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Hero from '../components/Hero';
import FeatureIcon from '../components/FeatureIcon';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import RatingComponent from '../components/RatingComponent';
import WriteReviewModal from '../components/WriteReviewModal';
import { categories as initialCategories, products as initialProducts, testimonials } from '../data/mockData';
import { 
  RiArrowRightLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiArrowUpSLine,
  RiEditLine,
  RiShieldCheckFill,
  RiSparklingFill
} from 'react-icons/ri';

const Home = () => {
  const { productsList, features, categories: appCategories, promoBanner, user, triggerToast, reviews, addReview } = useApp();
  const products = (productsList && productsList.length > 0) ? productsList : initialProducts;
  const categories = (appCategories && appCategories.length > 0) ? appCategories : initialCategories;
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [homeBlogs, setHomeBlogs] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const categoryRailRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchHomeBlogs() {
      try {
        const res = await fetch('/api/blogs', { credentials: 'include' });
        const data = await res.json();
        if (data.success && isMounted && Array.isArray(data.blogs)) {
          setHomeBlogs(data.blogs.slice(0, 3));
        } else {
          const cached = localStorage.getItem('cached_blogs');
          if (cached && isMounted) {
            setHomeBlogs(JSON.parse(cached).slice(0, 3));
          }
        }
      } catch (e) {
        const cached = localStorage.getItem('cached_blogs');
        if (cached && isMounted) {
          setHomeBlogs(JSON.parse(cached).slice(0, 3));
        }
      }
    }
    fetchHomeBlogs();
    return () => { isMounted = false; };
  }, []);

  const checkScroll = () => {
    if (categoryRailRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryRailRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories, showAllCategories]);

  const scrollCategoryRail = (direction) => {
    if (categoryRailRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      categoryRailRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  // Real number of products in each category
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter products for various sections
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  // Promo banner claim discount action (redirect to login if unauthenticated)
  const promoTarget = promoBanner?.btnLink || '/shop';
  const promoClaimLink = user 
    ? promoTarget 
    : `/login?redirect=${encodeURIComponent(promoTarget)}`;

  const handleClaimDiscountClick = () => {
    if (!user) {
      triggerToast('Please log in or register to claim your discount.', 'info');
    } else if (promoBanner?.couponCode) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(promoBanner.couponCode).catch(() => {});
      }
      triggerToast(`Coupon code "${promoBanner.couponCode}" copied! Use it at checkout.`, 'success');
    }
  };

  return (
    <div className="flex flex-col gap-10 md:gap-16 py-2 md:py-4">
      {/* Hero Banner Carousel */}
      <Hero />

      {/* Brand Value Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-6 p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-xs">
        {(features && features.length > 0 ? features : []).map((feat) => (
          <div key={feat.id} className="flex items-center gap-2.5 sm:gap-4 text-left min-w-0">
            <div className="shrink-0 p-2 sm:p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <FeatureIcon feature={feat} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {feat.title}
              </p>
              <p className="text-[11px] sm:text-xs leading-snug text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {feat.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Categories */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Shop by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Explore our premium catalog collections</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllCategories((prev) => !prev)}
            className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer bg-primary-50 dark:bg-primary-950/40 px-3.5 py-1.5 rounded-full border border-primary-200/50 dark:border-primary-800/50 shadow-2xs hover:shadow-xs active:scale-95"
            aria-label={showAllCategories ? "Show fewer categories" : "See more categories"}
          >
            <span>{showAllCategories ? "View Less" : `See More (${categories.length})`}</span>
            {showAllCategories ? (
              <RiArrowUpSLine className="w-4 h-4 transition-transform" />
            ) : (
              <RiArrowRightLine className="w-4 h-4 transition-transform" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!showAllCategories ? (
            /* Continuous Left-to-Right Animated Marquee with Pause on Hover */
            <motion.div
              key="marquee-track"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative w-full overflow-hidden py-2 -mx-3 px-3 sm:-mx-4 sm:px-4"
            >
              {/* Fade Edges for smooth modern aesthetic */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

              <div className="animate-marquee-ltr flex items-center gap-4 sm:gap-6 md:gap-8">
                {/* 4 sets of categories to ensure seamless infinite left-to-right looping */}
                {[...categories, ...categories, ...categories, ...categories].map((category, idx) => (
                  <div key={`${category.id}-${idx}`} className="shrink-0">
                    <CategoryCard
                      category={category}
                      count={categoryCounts[category.id] || 0}
                      index={idx % categories.length}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Expanded Full Grid when user clicks "See More" */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-6 py-4 justify-items-center w-full bg-slate-50/60 dark:bg-slate-900/40 p-4 sm:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60"
            >
              {categories.map((category, idx) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  count={categoryCounts[category.id] || 0}
                  index={idx}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Promotional Banner (Admin Managed) */}
      {promoBanner && promoBanner.isVisible !== false && (
        <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${promoBanner.bgGradient || 'from-violet-600 to-indigo-850'} p-6 md:p-12 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8`}>
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="w-full md:w-3/5 text-left relative z-10 flex flex-col items-start">
            {promoBanner.badge && (
              <span className="text-[10px] font-extrabold tracking-widest text-white bg-white/15 px-3 py-1 rounded-full uppercase mb-4">
                {promoBanner.badge}
              </span>
            )}
            <h2 className="text-2xl md:text-4xl font-black leading-tight mb-4">
              {promoBanner.title}
            </h2>
            <div className="text-xs md:text-sm text-slate-200 mb-6 leading-relaxed max-w-md">
              <span>{promoBanner.description}</span>
              {promoBanner.couponCode && (
                <span className="block mt-2">
                  Use coupon code <strong className="text-white bg-slate-950/45 px-2 py-0.5 rounded font-mono font-bold tracking-wider">{promoBanner.couponCode}</strong> during checkout.
                </span>
              )}
            </div>
            {/* Desktop Button */}
            <div className="hidden md:block">
              <Link
                to={promoClaimLink}
                onClick={handleClaimDiscountClick}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-primary-50 transition-all shadow-md hover:shadow-xl duration-200 flex items-center gap-2 cursor-pointer"
              >
                {promoBanner.btnText || 'Claim Discount'}
                <RiArrowRightLine className="w-4 h-4 animate-pulse" />
              </Link>
            </div>
          </div>
          {promoBanner.image && (
            <div className="w-full md:w-2/5 flex flex-col items-center justify-center relative z-10">
              <div className="relative flex justify-center w-full">
                <div className="absolute inset-0 bg-white/5 rounded-full filter blur-2xl" />
                <img
                  src={promoBanner.image}
                  alt={promoBanner.imageAlt || promoBanner.title || 'Promotional Offer'}
                  className="max-h-[160px] md:max-h-[200px] max-w-full object-contain rounded-2xl drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-10"
                />
              </div>
              {/* Mobile Button - placed directly below image */}
              <div className="md:hidden mt-4 z-20">
                <Link
                  to={promoClaimLink}
                  onClick={handleClaimDiscountClick}
                  className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-full hover:bg-primary-50 transition-all shadow-md duration-200 flex items-center gap-2 cursor-pointer text-sm"
                >
                  {promoBanner.btnText || 'Claim Discount'}
                  <RiArrowRightLine className="w-4 h-4 animate-pulse" />
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Featured Products */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Featured Products</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Our handpicked design highlights of the season</p>
          </div>
          <Link to="/shop" className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
            View All <RiArrowRightLine />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Best Selling Products</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Top-voted favorites by our community</p>
          </div>
          <Link to="/shop" className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
            View All <RiArrowRightLine />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">New Arrivals</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Fresh drop additions to upgrade your space</p>
          </div>
          <Link to="/shop" className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
            View All <RiArrowRightLine />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Latest Journal & Blogs */}
      {homeBlogs.length > 0 && (
        <section className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-end justify-between gap-3">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">From The Journal</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Stories of sound, craftsmanship and modern luxury</p>
            </div>
            <Link to="/blogs" className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
              See More Blogs <RiArrowRightLine />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {homeBlogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug || blog.id}`}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={blog.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-white border border-white/20">
                      {blog.category || 'Journal'}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {blog.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">{blog.read_time || '5 min read'}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                      See More <RiArrowRightLine className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Customer Testimonials & Reviews Marquee */}
      {(() => {
        const activeReviews = (reviews && reviews.length > 0) ? reviews : testimonials;
        const totalRatingSum = activeReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        const averageRating = (totalRatingSum / activeReviews.length).toFixed(1);

        // Ensure seamless looping for marquee (repeat if needed)
        const marqueeReviews = activeReviews.length < 4
          ? [...activeReviews, ...activeReviews, ...activeReviews, ...activeReviews]
          : activeReviews.length < 8
            ? [...activeReviews, ...activeReviews]
            : activeReviews;

        return (
          <section className="flex flex-col gap-6 py-6 border-t border-slate-100 dark:border-slate-800/80">
            {/* Header with Title and "Write a Review" button */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                  <RiSparklingFill size={13} className="text-amber-500" />
                  Verified Customer Stories
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  What Our Customers Say
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-amber-500">
                    <RatingComponent rating={parseFloat(averageRating)} size={15} />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 ml-1">
                      {averageRating} / 5.0
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">•</span>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Based on {activeReviews.length} real reviews from verified buyers across UAE
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-md shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <RiEditLine size={16} />
                  <span>Write a Review</span>
                </button>
              </div>
            </div>

            {/* Continuous Left-to-Right Marquee Banner */}
            <div className="relative overflow-hidden py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 group">
              {/* Fade gradient overlays on left and right for sleek edge transitions */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-32 z-10 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-32 z-10 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent" />

              {/* Marquee Track moving Left to Right (animate-marquee-ltr) */}
              <div className="animate-marquee-ltr flex gap-4 sm:gap-6 py-2">
                {marqueeReviews.map((test, index) => (
                  <div
                    key={`${test.id}-${index}`}
                    className="w-[300px] sm:w-[380px] shrink-0 flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-xl hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-300 select-none group/card"
                  >
                    <div>
                      {/* Rating & Verified Badge */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-1.5">
                          <RatingComponent rating={test.rating} size={15} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {Number(test.rating).toFixed(1)}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <RiShieldCheckFill size={13} />
                          Verified
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed line-clamp-4 font-normal">
                        "{test.comment}"
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={test.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(test.name || 'User')}`}
                          alt={test.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(test.name || 'User')}`;
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {test.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {test.role || 'Verified Buyer'}
                          </p>
                        </div>
                      </div>

                      {test.date && (
                        <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                          {test.date}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Helper */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 -mt-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hover on any card to pause scrolling
              </span>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline cursor-pointer"
              >
                Have something to say? Share your thoughts &rarr;
              </button>
            </div>
          </section>
        );
      })()}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={addReview}
      />
    </div>
  );
};

export default Home;
