import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RatingComponent from './RatingComponent';
import { RiHeartLine, RiHeartFill, RiShoppingBagLine, RiHandCoinLine } from 'react-icons/ri';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useApp();

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const discountPrice = product.discountPrice;
  const isDiscounted = discountPrice && discountPrice < product.price;

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="block w-full h-full">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.altText || product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-950 text-slate-400 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-900 transition-colors">
              <RiShoppingBagLine className="w-8 h-8 sm:w-10 sm:h-10 mb-1 opacity-30 text-slate-500" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">VANTA DUBAI</span>
            </div>
          )}
        </div>

        {/* Discount Badge */}
        {isDiscounted && (
          <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-[#A83E68] text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-xs z-10">
            -{product.discountPercentage || Math.round((1 - discountPrice / product.price) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 p-1 sm:p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:text-[#A83E68] dark:hover:text-[#A83E68] shadow-2xs hover:shadow-xs transition-all duration-200 z-10 cursor-pointer"
          aria-label="Add to wishlist"
        >
          {isWishlisted ? (
            <RiHeartFill className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#A83E68]" />
          ) : (
            <RiHeartLine className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-2 sm:p-3.5 flex flex-col flex-grow">
        {/* Brand & Category */}
        <div className="flex items-center gap-1 mb-0.5 sm:mb-1 min-w-0">
          <span className="text-[8px] sm:text-[10px] tracking-wider uppercase font-semibold text-primary-600 dark:text-primary-400 truncate">
            {product.brand}
          </span>
          <span className="text-[8px] sm:text-[10px] text-slate-400">•</span>
          <span className="text-[8px] sm:text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 truncate">
            {product.category}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-[11px] sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 mb-1 sm:mb-1.5 line-clamp-2 min-h-[28px] sm:min-h-[38px] leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2.5">
          <RatingComponent rating={product.rating || 4.9} size={10} />
          <span className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500">
            ({product.reviewsCount || (product.reviews ? product.reviews.length : 11)})
          </span>
        </div>

        {/* Footer info: Price & COD Badge */}
        <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800/80 gap-1">
          <div className="min-w-0 flex-1">
            {isDiscounted ? (
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 line-through leading-none truncate">
                  AED {product.price.toFixed(2)}
                </span>
                <span className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                  AED {discountPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                AED {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center shrink-0">
            {/* Cash on Delivery Badge */}
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg bg-[#35152F]/10 dark:bg-[#35152F]/40 text-[#35152F] dark:text-[#F7F5F1] text-[8px] sm:text-[10px] font-bold border border-[#35152F]/20">
              <RiHandCoinLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D9A441]" />
              <span>COD</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
