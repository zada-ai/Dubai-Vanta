import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { 
  RiArrowRightLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine 
} from 'react-icons/ri';

const ProductSwipeSection = ({ 
  title, 
  subtitle, 
  products = [], 
  viewAllLink = '/shop' 
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 sm:gap-5">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-3">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Left/Right Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 border-slate-200/50 dark:border-slate-800 cursor-not-allowed opacity-50'
              }`}
              aria-label="Previous products"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 border-slate-200/50 dark:border-slate-800 cursor-not-allowed opacity-50'
              }`}
              aria-label="Next products"
            >
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </div>

          {/* View All Button */}
          <Link
            to={viewAllLink}
            className="whitespace-nowrap text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Swipeable Horizontal Product Rail */}
      <div className="relative -mx-3 px-3 sm:-mx-4 sm:px-4">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2.5 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1.5 sm:py-2 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[145px] sm:w-[210px] md:w-[240px] lg:w-[260px] shrink-0 snap-start flex flex-col"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSwipeSection;
