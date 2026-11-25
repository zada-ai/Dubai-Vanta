import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RiHeadphoneLine, 
  RiShirtLine, 
  RiHome4Line, 
  RiHeartPulseLine, 
  RiGamepadLine, 
  RiSparkling2Line, 
  RiShoppingBag3Line,
  RiShoppingBasketLine,
  RiFootprintLine
} from 'react-icons/ri';

// Helper to get category icons when image is missing
const getCategoryIcon = (id = '', name = '') => {
  const key = `${id} ${name}`.toLowerCase();
  if (key.includes('elec') || key.includes('audio') || key.includes('gadget') || key.includes('phone')) return RiHeadphoneLine;
  if (key.includes('fash') || key.includes('cloth') || key.includes('apparel') || key.includes('wear')) return RiShirtLine;
  if (key.includes('lux') || key.includes('jewel') || key.includes('watch') || key.includes('bag')) return RiSparkling2Line;
  if (key.includes('home') || key.includes('decor') || key.includes('living') || key.includes('furn')) return RiHome4Line;
  if (key.includes('well') || key.includes('fit') || key.includes('health') || key.includes('beauty')) return RiHeartPulseLine;
  if (key.includes('game') || key.includes('vr')) return RiGamepadLine;
  if (key.includes('groc') || key.includes('food') || key.includes('market')) return RiShoppingBasketLine;
  if (key.includes('sneak') || key.includes('shoe') || key.includes('foot')) return RiFootprintLine;
  return RiShoppingBag3Line;
};

const CategoryCard = ({ category, count, index = 0 }) => {
  const [imgError, setImgError] = useState(false);
  const rawImage = category.image;
  const resolvedImage = rawImage
    ? (rawImage.startsWith('/uploads/') ? rawImage.replace('/uploads/', '/storage/') : rawImage)
    : null;

  const to = `/shop?category=${encodeURIComponent(category.id)}`;
  const IconComponent = getCategoryIcon(category.id, category.name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col items-center select-none"
    >
      <Link 
        to={to} 
        className="group flex flex-col items-center text-center cursor-pointer focus:outline-hidden"
      >
        {/* Circular Avatar Container (Small on mobile, responsive on desktop) */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full aspect-square bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950 shadow-sm group-hover:ring-2 group-hover:ring-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/15 transition-all duration-300 flex items-center justify-center overflow-hidden">
          {resolvedImage && !imgError ? (
            <img
              src={resolvedImage}
              alt={category.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
        </div>

        {/* Category Label Underneath */}
        <span className="mt-3 text-[11px] sm:text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 max-w-[4.5rem] sm:max-w-[5.75rem] md:max-w-[7.5rem] tracking-tight text-center">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
