import React, { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const ProductSwipeSection = ({
  eyebrow,
  title, 
  subtitle, 
  products = [], 
  viewAllLink = '/shop',
  className = '',
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
    <section className={`flex flex-col gap-4 sm:gap-6 ${className}`}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actionLabel="View All"
        actionTo={viewAllLink}
      >
        <div className="hidden sm:flex items-center gap-1.5">
          {[
            { dir: 'left', enabled: canScrollLeft, Icon: RiArrowLeftSLine, label: 'Previous products' },
            { dir: 'right', enabled: canScrollRight, Icon: RiArrowRightSLine, label: 'Next products' },
          ].map(({ dir, enabled, Icon, label }) => (
            <button
              key={dir}
              type="button"
              onClick={() => handleScroll(dir)}
              disabled={!enabled}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </SectionHeader>

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
