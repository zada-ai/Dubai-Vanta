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
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.altText || product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 text-slate-400 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-900 transition-colors">
              <RiShoppingBagLine className="w-10 h-10 mb-1 opacity-30 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">VANTA DUBAI</span>
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {isDiscounted && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-sm z-10">
            -{product.discountPercentage || Math.round((1 - discountPrice / product.price) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-500 shadow-xs hover:shadow-md transition-all duration-200 z-10 cursor-pointer"
          aria-label="Add to wishlist"
        >
          {isWishlisted ? (
            <RiHeartFill className="w-5 h-5 text-rose-500 animate-pulse" />
          ) : (
            <RiHeartLine className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Brand & Category */}
        <div className="flex items-center gap-1.5 mb-1 min-w-0">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-primary-600 dark:text-primary-400 truncate">
            {product.brand}
          </span>
          <span className="text-[10px] text-slate-400">•</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 truncate">
            {product.category}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 mb-1.5 line-clamp-2 min-h-[40px]">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <RatingComponent rating={product.rating} size={13} />
          <span className="text-xs text-slate-400 dark:text-slate-500">({product.reviewsCount})</span>
        </div>

        {/* Footer info: Price & Add to Cart */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            {isDiscounted ? (
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through leading-none">
                  AED {product.price.toFixed(2)}
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none mt-1">
                  AED {discountPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                AED {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Add to Cart button */}
            <button
              onClick={() => addToCart(product)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-primary-600 dark:bg-slate-800 dark:hover:bg-primary-600 text-white shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
              aria-label="Add to cart"
              disabled={product.stock === 0}
              title="Add to Cart"
            >
              <RiShoppingBagLine className="w-4 h-4" />
            </button>

            {/* Direct Cash on Delivery Button - redirects to dedicated checkout page */}
            <button
              onClick={() => {
                addToCart(product);
                navigate('/checkout');
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Order with Cash on Delivery"
              disabled={product.stock === 0}
              title={product.stock === 0 ? "Out of Stock" : "Quick Order with Cash on Delivery"}
            >
              <RiHandCoinLine className="w-4 h-4" />
              <span className="hidden xs:inline">COD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
