import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiShoppingBagLine } from 'react-icons/ri';

const CategoryImage = ({ category, className }) => {
  const [imgError, setImgError] = useState(false);
  const rawImage = category.image;
  const resolvedImage = rawImage
    ? (rawImage.startsWith('/uploads/') ? rawImage.replace('/uploads/', '/storage/') : rawImage)
    : null;

  if (resolvedImage && !imgError) {
    return (
      <img
        src={resolvedImage}
        alt={category.name}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover object-center ${className || ''}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-900/40 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-2 text-center">
      <RiShoppingBagLine className="w-6 h-6 text-primary-400 mb-1 opacity-80" />
      <span className="font-black text-white/40 uppercase tracking-widest text-xs truncate max-w-[80%]">
        {category.name?.slice(0, 4)}
      </span>
    </div>
  );
};

/**
 * variant="card"    – large image card (desktop grids)
 * variant="compact" – small square tile with the name underneath (mobile rails, many categories)
 * `count` overrides category.count with the real number of products.
 */
const CategoryCard = ({ category, count, variant = 'card' }) => {
  const productCount = count ?? category.count ?? 0;
  const to = `/shop?category=${encodeURIComponent(category.id)}`;

  if (variant === 'compact') {
    return (
      <Link to={to} className="group flex flex-col items-center gap-1.5 text-center min-w-0">
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 shadow-xs group-active:scale-95 transition-transform text-sm">
          <CategoryImage category={category} />
        </div>
        <div className="w-full min-w-0">
          <h3 className="text-[11px] leading-tight font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
            {category.name}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{productCount} items</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group block relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900"
    >
      <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative text-2xl">
        <CategoryImage category={category} className="group-hover:scale-105 transition-transform duration-500" />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Content overlaid on image */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white">
          <h3 className="text-sm sm:text-base font-bold tracking-tight mb-1 group-hover:text-primary-300 transition-colors line-clamp-1">
            {category.name}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-1 font-medium">
            {productCount} Products
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
