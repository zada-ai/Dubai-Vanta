import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Hero from '../components/Hero';
import FeatureIcon from '../components/FeatureIcon';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import RatingComponent from '../components/RatingComponent';
import { categories as initialCategories, products as initialProducts, testimonials } from '../data/mockData';
import { RiArrowRightLine } from 'react-icons/ri';

const Home = () => {
  const { productsList, features, categories: appCategories, promoBanner } = useApp();
  const products = productsList || initialProducts;
  const categories = appCategories || initialCategories;

  // Filter products for various sections
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

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
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {feat.title}
              </h4>
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
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
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
            <Link
              to={promoBanner.btnLink || '/shop'}
              className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-primary-50 transition-all shadow-md hover:shadow-xl duration-200 flex items-center gap-2 cursor-pointer"
            >
              {promoBanner.btnText || 'Claim Discount'}
              <RiArrowRightLine className="w-4 h-4 animate-pulse" />
            </Link>
          </div>
          {promoBanner.image && (
            <div className="w-full md:w-2/5 flex justify-center relative">
              <div className="absolute inset-0 bg-white/5 rounded-full filter blur-2xl" />
              <img
                src={promoBanner.image}
                alt={promoBanner.imageAlt || promoBanner.title || 'Promotional Offer'}
                className="max-h-[160px] md:max-h-[200px] max-w-full object-contain rounded-2xl drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-10"
              />
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

      {/* Customer Testimonials */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">What Our Customers Say</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Real reviews from verified buyers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-2 sm:mt-4">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="flex flex-col items-start p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <RatingComponent rating={test.rating} size={14} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-6 leading-relaxed">
                "{test.comment}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{test.name}</h4>
                  <p className="text-xs text-slate-400">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
