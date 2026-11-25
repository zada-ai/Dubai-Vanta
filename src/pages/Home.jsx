import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Hero from '../components/Hero';
import FeatureIcon from '../components/FeatureIcon';
import CategoryCard from '../components/CategoryCard';
import ProductSwipeSection from '../components/ProductSwipeSection';
import RatingComponent from '../components/RatingComponent';
import SectionHeader from '../components/SectionHeader';
import { brandGradient } from '../utils/brandGradient';
import { categories as initialCategories, testimonials } from '../data/mockData';
import {
  RiArrowRightLine,
  RiShieldCheckFill,
  RiDoubleQuotesL,
  RiFileCopyLine,
} from 'react-icons/ri';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const avatarFallback = (name) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;

const Home = () => {
  const { productsList, features, categories: appCategories, promoBanner, user, triggerToast, reviews } = useApp();
  const products = useMemo(() => productsList || [], [productsList]);
  const categories = (appCategories && appCategories.length > 0) ? appCategories : initialCategories;
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Real number of products in each category
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Categories that actually have products (dummy categories excluded)
  const activeCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!c) return false;
      if (['groceries', 'sneakers', 'gaming-vr'].includes(c.id)) return false;
      const count = categoryCounts[c.id] ?? c.count ?? 0;
      return count > 0;
    });
  }, [categories, categoryCounts]);

  // Product sections with fallback for imported catalogs
  const featuredProducts = useMemo(() => {
    const explicitlyFeatured = products.filter(p => p.isFeatured);
    return (explicitlyFeatured.length > 0 ? explicitlyFeatured : products).slice(0, 16);
  }, [products]);

  const bestSellers = useMemo(() => {
    const explicitlyBest = products.filter(p => p.isBestSeller);
    return (explicitlyBest.length > 0 ? explicitlyBest : products.slice(16)).slice(0, 16);
  }, [products]);

  const newArrivals = useMemo(() => {
    const explicitlyNew = products.filter(p => p.isNewArrival);
    return (explicitlyNew.length > 0 ? explicitlyNew : products.slice(32)).slice(0, 16);
  }, [products]);

  // Reviews summary
  const activeReviews = (reviews && reviews.length > 0) ? reviews : testimonials;
  const averageRating = activeReviews.length
    ? (activeReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / activeReviews.length).toFixed(1)
    : '5.0';
  const marqueeReviews = activeReviews.length < 4
    ? [...activeReviews, ...activeReviews, ...activeReviews, ...activeReviews]
    : activeReviews.length < 8
      ? [...activeReviews, ...activeReviews]
      : activeReviews;

  // Promo banner claim action (redirect to login if unauthenticated)
  const promoTarget = promoBanner?.btnLink || '/shop';
  const promoClaimLink = user ? promoTarget : `/login?redirect=${encodeURIComponent(promoTarget)}`;

  const copyCoupon = () => {
    if (!promoBanner?.couponCode) return;
    if (navigator.clipboard) navigator.clipboard.writeText(promoBanner.couponCode).catch(() => {});
    triggerToast(`Coupon code "${promoBanner.couponCode}" copied! Use it at checkout.`, 'success');
  };

  const handleClaimDiscountClick = () => {
    if (!user) {
      triggerToast('Please log in or register to claim your discount.', 'info');
    } else {
      copyCoupon();
    }
  };

  const featureList = features && features.length > 0 ? features : [];

  return (
    <div className="flex flex-col gap-12 md:gap-20 py-1 md:py-2">
      {/* ───────── Hero + trust bar ───────── */}
      <div className="flex flex-col gap-4 md:gap-6">
        {/* The page's single H1: stable text (the carousel slides use H2) */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 sm:gap-6 pt-1">
          <h1 className="text-[22px] leading-tight sm:text-3xl text-slate-900 dark:text-white">
            Online shopping in Dubai, <span className="italic text-primary-700 dark:text-primary-400">delivered to your door</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 sm:text-right shrink-0">
            Cash on Delivery across the UAE
          </p>
        </header>

        <Hero />

        {featureList.length > 0 && (
          <section
            aria-label="Why shop with us"
            className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            {featureList.map((feat, i) => (
              <div
                key={feat.id}
                className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 min-w-0 border-slate-100 dark:border-slate-800 ${
                  i % 2 === 1 ? 'border-l' : ''
                } ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
              >
                <div className="shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                  <FeatureIcon feature={feat} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {feat.title}
                  </p>
                  <p className="text-[11px] sm:text-xs leading-snug text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* ───────── Categories ───────── */}
      {activeCategories.length > 0 && (
        <motion.section {...fadeUp} className="flex flex-col gap-5 sm:gap-7">
          <SectionHeader
            eyebrow="Browse"
            title="Shop by Category"
            subtitle="Explore our curated collections"
            actionLabel={showAllCategories ? 'Show Less' : 'View All'}
            onAction={() => setShowAllCategories((prev) => !prev)}
          />

          <AnimatePresence mode="wait" initial={false}>
            {!showAllCategories ? (
              <motion.div
                key="marquee-track"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full overflow-hidden py-3"
              >
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

                <div className="animate-marquee-rtl flex items-start gap-5 sm:gap-8 md:gap-10">
                  {[...activeCategories, ...activeCategories, ...activeCategories, ...activeCategories].map((category, idx) => (
                    <div key={`${category.id}-${idx}`} className="shrink-0">
                      <CategoryCard
                        category={category}
                        count={categoryCounts[category.id] || 0}
                        index={idx % activeCategories.length}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6 sm:gap-8 justify-items-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8"
              >
                {activeCategories.map((category, idx) => (
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
        </motion.section>
      )}

      {/* ───────── Featured ───────── */}
      <motion.div {...fadeUp}>
        <ProductSwipeSection
          eyebrow="Handpicked"
          title="Featured Products"
          subtitle="Our top picks of the season"
          products={featuredProducts}
          viewAllLink="/shop"
        />
      </motion.div>

      {/* ───────── Promo banner (admin managed) ───────── */}
      {promoBanner && promoBanner.isVisible !== false && (
        <motion.section
          {...fadeUp}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${brandGradient(promoBanner.bgGradient)} text-white shadow-xl shadow-slate-900/10`}
        >
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-50 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid md:grid-cols-5 items-center gap-6 md:gap-10 p-6 sm:p-10 md:p-14">
            <div className="md:col-span-3 flex flex-col items-start text-left">
              {promoBanner.badge && (
                <span className="mb-4 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                  {promoBanner.badge}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-balance">
                {promoBanner.title}
              </h2>
              {promoBanner.description && (
                <p className="mt-3 md:mt-4 max-w-lg text-sm md:text-base leading-relaxed text-white/80">
                  {promoBanner.description}
                </p>
              )}

              <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={promoClaimLink}
                  onClick={handleClaimDiscountClick}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm md:text-base font-bold text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-100 transition-colors"
                >
                  {promoBanner.btnText || 'Claim Discount'}
                  <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                {promoBanner.couponCode && (
                  <button
                    type="button"
                    onClick={copyCoupon}
                    title="Copy coupon code"
                    className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/50 bg-black/15 px-4 py-3 text-sm font-mono font-bold tracking-wider hover:bg-black/25 transition-colors cursor-pointer"
                  >
                    {promoBanner.couponCode}
                    <RiFileCopyLine className="h-4 w-4 opacity-80" />
                  </button>
                )}
              </div>
            </div>

            {promoBanner.image && (
              <div className="md:col-span-2 relative flex justify-center">
                <div className="absolute inset-6 rounded-full bg-white/15 blur-2xl" />
                <img
                  src={promoBanner.image}
                  alt={promoBanner.imageAlt || promoBanner.title || 'Promotional offer'}
                  className="relative max-h-[170px] md:max-h-[260px] max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:-translate-y-1"
                />
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* ───────── Best sellers (tinted panel for rhythm) ───────── */}
      {bestSellers.length > 0 && (
        <motion.div
          {...fadeUp}
          className="-mx-3 sm:mx-0 rounded-none sm:rounded-3xl bg-white dark:bg-slate-900/60 border-y sm:border border-slate-200/80 dark:border-slate-800 px-3 py-7 sm:p-8 md:p-10"
        >
          <ProductSwipeSection
            eyebrow="Trending"
            title="Best Sellers"
            subtitle="Customer favourites, loved across the UAE"
            products={bestSellers}
            viewAllLink="/shop"
          />
        </motion.div>
      )}

      {/* ───────── New arrivals ───────── */}
      <motion.div {...fadeUp}>
        <ProductSwipeSection
          eyebrow="Just Landed"
          title="New Arrivals"
          subtitle="Fresh additions to the collection"
          products={newArrivals}
          viewAllLink="/shop"
        />
      </motion.div>

      {/* ───────── Testimonials ───────── */}
      {activeReviews.length > 0 && (
        <motion.section {...fadeUp} className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <SectionHeader
              eyebrow="Testimonials"
              title="What Our Customers Say"
              subtitle="Real reviews from verified buyers"
            />
            <div className="flex items-center gap-4 self-start sm:self-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 shadow-sm">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {averageRating}
              </span>
              <div className="flex flex-col gap-1">
                <RatingComponent rating={parseFloat(averageRating)} size={15} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeReviews.length} verified {activeReviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden py-2">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-28 z-10 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-28 z-10 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent" />

            <div className="animate-marquee-rtl flex gap-4 sm:gap-6 py-2">
              {marqueeReviews.map((test, index) => (
                <figure
                  key={`${test.id}-${index}`}
                  className="relative w-[290px] sm:w-[370px] shrink-0 flex flex-col p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary-500/40 transition-all duration-300 select-none"
                >
                  <RiDoubleQuotesL className="absolute right-5 top-5 h-8 w-8 text-primary-500/15" />
                  <div className="flex items-center gap-2 mb-4">
                    <RatingComponent rating={test.rating} size={14} />
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <RiShieldCheckFill size={13} />
                      Verified
                    </span>
                  </div>

                  <blockquote className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 mb-5">
                    “{test.comment}”
                  </blockquote>

                  <figcaption className="flex items-center gap-3 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 min-w-0">
                    <img
                      src={test.avatar || avatarFallback(test.name)}
                      alt={test.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = avatarFallback(test.name);
                      }}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{test.name}</p>
                      <p className="text-xs text-slate-400 truncate">{test.role || 'Verified Buyer'}</p>
                    </div>
                    {test.date && <span className="text-[11px] text-slate-400 shrink-0">{test.date}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;
