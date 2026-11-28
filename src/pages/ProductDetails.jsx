import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products as initialProducts } from '../data/mockData';
import RatingComponent from '../components/RatingComponent';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { generateProductReviews } from '../utils/reviewsGenerator';
import { 
  RiHeartLine, 
  RiHeartFill, 
  RiShoppingBag3Line, 
  RiShoppingCartLine,
  RiCheckLine,
  RiCheckboxCircleFill,
  RiShieldCheckFill,
  RiAddLine,
  RiSubtractLine,
  RiShieldCheckLine,
  RiExchangeLine,
  RiArrowRightLine,
  RiHandCoinLine,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from 'react-icons/ri';

const ProductDetails = () => {
  const { id } = useParams();
  const { productsList } = useApp();
  const products = productsList || initialProducts;

  // Find current product (supports UUID or SKU)
  const product = products.find((p) => String(p.id) === String(id) || (p.sku && p.sku.toLowerCase() === String(id).toLowerCase()));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/shop" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  return <ProductView key={product.id} id={id} product={product} products={products} />;
};

const ProductView = ({ id, product, products }) => {
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, triggerToast, openCodModal } = useApp();

  const availableColors = useMemo(() => {
    if (Array.isArray(product.colors) && product.colors.length > 0) return product.colors;
    if (typeof product.colors === 'string' && product.colors.trim()) {
      try {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
      const splitted = product.colors.split(',').map((c) => c.trim()).filter(Boolean);
      if (splitted.length > 0) return splitted;
    }
    return ['#000000', '#FFFFFF', '#2563EB', '#16A34A', '#DC2626'];
  }, [product.colors]);

  const colorImages = useMemo(() => {
    if (!product.colorImages) return {};
    if (typeof product.colorImages === 'string') {
      try {
        const parsed = JSON.parse(product.colorImages);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
    return typeof product.colorImages === 'object' ? product.colorImages : {};
  }, [product.colorImages]);

  const productImages = useMemo(() => {
    const base = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && !base.includes(img)) base.push(img);
      });
    } else if (typeof product.image === 'string' && product.image.trim()) {
      const raw = product.image.trim();
      if (raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) parsed.forEach((img) => img && !base.includes(img) && base.push(img));
        } catch {}
      } else if (raw.includes('|')) {
        raw.split('|').map((s) => s.trim()).filter(Boolean).forEach((img) => !base.includes(img) && base.push(img));
      } else {
        base.push(raw);
      }
    }
    // Include any optional color-linked images in gallery if not already present
    Object.values(colorImages).forEach((img) => {
      if (img && typeof img === 'string' && img.trim() && !base.includes(img.trim())) {
        base.push(img.trim());
      }
    });
    return base;
  }, [product.images, product.image, colorImages]);

  // Gallery, options and review states
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '#000000');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const swipeStartX = useRef(null);

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (productImages.length <= 1) return;
    setActiveImgIdx((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (productImages.length <= 1) return;
    setActiveImgIdx((prev) => (prev + 1) % productImages.length);
  };

  const handleSwipeStart = (clientX) => {
    if (productImages.length <= 1) return;
    swipeStartX.current = clientX;
  };

  const handleSwipeEnd = (clientX) => {
    if (swipeStartX.current === null || productImages.length <= 1) return;
    const diff = swipeStartX.current - clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setActiveImgIdx((prev) => (prev + 1) % productImages.length);
      } else {
        setActiveImgIdx((prev) => (prev - 1 + productImages.length) % productImages.length);
      }
    }
    swipeStartX.current = null;
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    const linkedImg = colorImages[color];
    if (linkedImg) {
      const idx = productImages.indexOf(linkedImg);
      if (idx !== -1) {
        setActiveImgIdx(idx);
      }
    }
  };
  
  // Custom reviews state (defaults to 10-12 verified UAE reviews)
  const [customReviews, setCustomReviews] = useState(() => {
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
      return product.reviews;
    }
    return generateProductReviews(product);
  });
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Safe, complete product specifications calculation
  const productSpecs = useMemo(() => {
    let rawSpecs = product.specs;
    if (typeof rawSpecs === 'string') {
      try {
        rawSpecs = JSON.parse(rawSpecs);
      } catch (_) {
        rawSpecs = null;
      }
    }
    if (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs) && Object.keys(rawSpecs).length > 0) {
      return rawSpecs;
    }

    const generated = {};
    if (product.sku) generated['SKU / Model'] = product.sku;
    if (product.brand) generated['Brand'] = product.brand;
    if (product.category) generated['Category'] = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    generated['Availability'] = (product.stock > 0) ? `In Stock (${product.stock} units)` : 'Out of Stock';
    generated['Authenticity'] = '100% Genuine & Verified';
    generated['Warranty'] = '1-Year Warranty / 7-Day Replacement Guarantee';
    generated['Delivery'] = 'Fast Express Shipping Across UAE & GCC';
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      generated['Colors'] = product.colors.join(', ');
    }
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      generated['Sizes'] = product.sizes.join(', ');
    }
    return generated;
  }, [product]);

  useEffect(() => {
    // Scroll window immediately to top when product page loads or changes
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Reset states when product changes
    setActiveImgIdx(0);
    setSelectedColor(availableColors[0] || '#000000');
    setSelectedSize(product.sizes?.[0] || '');
    setQuantity(1);
    const initialRevs = (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0)
      ? product.reviews
      : generateProductReviews(product);
    setCustomReviews(initialRevs);
    setNewReview({ name: '', rating: 5, comment: '' });

    // Fetch the latest reviews from the database API
    if (product?.id) {
      fetch(`/api/products/${product.id}/reviews`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setCustomReviews(data.reviews);
          }
        })
        .catch(() => {});
    }
  }, [id, product, availableColors]);

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const discountPrice = product.discountPrice;
  const isDiscounted = discountPrice && discountPrice < product.price;
  const activePrice = discountPrice || product.price;
  const discountPercent = product.discountPercentage 
    ? Math.round(product.discountPercentage)
    : (isDiscounted && product.price ? Math.round(((product.price - discountPrice) / product.price) * 100) : 0);

  // Dynamic Product Page SEO & Schema.org JSON-LD (Google Rich Results)
  useEffect(() => {
    if (!product) return;

    const prevTitle = document.title;
    document.title = `${product.name} | Vanta Dubai`;

    let descTag = document.querySelector('meta[name="description"]');
    const prevDesc = descTag ? descTag.getAttribute('content') : '';
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', product.description ? product.description.slice(0, 160) : `${product.name} available at Vanta Dubai.`);

    // Calculate dynamic rating and count for SEO structured data
    const reviewsArr = Array.isArray(customReviews) ? customReviews : [];
    const avgRatingVal = reviewsArr.length > 0 
      ? (reviewsArr.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviewsArr.length).toFixed(1)
      : (product.rating || 4.9);
    const totalReviewsCount = reviewsArr.length || product.reviewsCount || 11;

    // Set Product Schema JSON-LD for Google Rich Results (SEO Friendly)
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images && product.images.length > 0 ? product.images : [product.image],
      "description": product.description ? product.description.slice(0, 300) : `${product.name} available at Vanta Dubai.`,
      "sku": product.sku || `VNT-${product.id}`,
      "mpn": product.sku || `VNT-PROD-${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Vanta Dubai"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "AED",
        "price": activePrice,
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Vanta Dubai"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(avgRatingVal),
        "reviewCount": String(totalReviewsCount),
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviewsArr.slice(0, 10).map((rev) => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": String(rev.rating || 5),
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": rev.name || "Verified Customer"
        },
        "datePublished": rev.date || new Date().toISOString().split('T')[0],
        "reviewBody": rev.comment || ''
      }))
    };

    let schemaTag = document.getElementById('product-schema-jsonld');
    if (!schemaTag) {
      schemaTag = document.createElement('script');
      schemaTag.setAttribute('type', 'application/ld+json');
      schemaTag.setAttribute('id', 'product-schema-jsonld');
      document.head.appendChild(schemaTag);
    }
    schemaTag.textContent = JSON.stringify(productSchema, null, 2);

    return () => {
      document.title = prevTitle;
      if (descTag && prevDesc) descTag.setAttribute('content', prevDesc);
      const tag = document.getElementById('product-schema-jsonld');
      if (tag) tag.remove();
    };
  }, [product, activePrice, customReviews]);

  // Quantity controls
  const handleQuantityIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      triggerToast(`Only ${product.stock} items currently in stock.`, 'warning');
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      triggerToast('Please fill out all fields before submitting.', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    const reviewPayload = {
      productId: product.id,
      name: newReview.name.trim(),
      rating: Number(newReview.rating) || 5,
      comment: newReview.comment.trim(),
      location: 'Dubai, UAE'
    };

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload)
      });
      const data = await res.json();
      if (data?.success && data.review) {
        setCustomReviews((prev) => [data.review, ...prev]);
        triggerToast('Review submitted successfully and saved to database!', 'success');
        setNewReview({ name: '', rating: 5, comment: '' });
      } else {
        const fallbackObj = {
          id: Date.now(),
          name: newReview.name.trim(),
          rating: Number(newReview.rating) || 5,
          location: 'Dubai, UAE',
          verified: true,
          date: new Date().toISOString().split('T')[0],
          comment: newReview.comment.trim()
        };
        setCustomReviews((prev) => [fallbackObj, ...prev]);
        triggerToast('Review submitted successfully!', 'success');
        setNewReview({ name: '', rating: 5, comment: '' });
      }
    } catch (_) {
      const fallbackObj = {
        id: Date.now(),
        name: newReview.name.trim(),
        rating: Number(newReview.rating) || 5,
        location: 'Dubai, UAE',
        verified: true,
        date: new Date().toISOString().split('T')[0],
        comment: newReview.comment.trim()
      };
      setCustomReviews((prev) => [fallbackObj, ...prev]);
      triggerToast('Review submitted successfully!', 'success');
      setNewReview({ name: '', rating: 5, comment: '' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Related products (custom super admin selected or same category fallback)
  const relatedProducts = useMemo(() => {
    if (product?.relatedSkuList && Array.isArray(product.relatedSkuList) && product.relatedSkuList.length > 0) {
      const explicit = products.filter((p) => 
        product.relatedSkuList.includes(p.sku) || 
        product.relatedSkuList.includes(String(p.id)) ||
        product.relatedSkuList.includes(p.name)
      );
      if (explicit.length > 0) return explicit;
    }
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Page Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Shop', path: '/shop' },
          { name: product.name }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-2">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4 w-full">
          <div
            className="group relative w-full max-w-[270px] sm:max-w-md lg:max-w-none mx-auto aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xs select-none touch-pan-y cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
            onMouseDown={(e) => handleSwipeStart(e.clientX)}
            onMouseUp={(e) => handleSwipeEnd(e.clientX)}
            onMouseLeave={() => { swipeStartX.current = null; }}
          >
            {productImages.length > 0 ? (
              <>
                <div
                  className="flex w-full h-full transition-transform duration-300 ease-out will-change-transform"
                  style={{ transform: `translateX(-${activeImgIdx * 100}%)` }}
                >
                  {productImages.map((imgSrc, idx) => (
                    <img
                      key={idx}
                      src={imgSrc}
                      alt={idx === 0 ? (product.altText || product.name) : `${product.name} - ${idx + 1}`}
                      draggable={false}
                      className="w-full h-full object-cover object-center shrink-0 pointer-events-none"
                    />
                  ))}
                </div>

                {/* Left / Right Swipe Arrow Controls */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 transition-all cursor-pointer z-10"
                    >
                      <RiArrowLeftSLine className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 transition-all cursor-pointer z-10"
                    >
                      <RiArrowRightSLine className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold z-10">
                      {activeImgIdx + 1} / {productImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-slate-400">
                <RiShoppingBag3Line className="w-16 h-16 mb-2 opacity-30 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VANTA DUBAI</span>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-13 h-13 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 bg-slate-100 dark:bg-slate-900 cursor-pointer transition-all ${
                    idx === activeImgIdx 
                      ? 'border-primary-600 dark:border-primary-500 shadow-md ring-2 ring-primary-500/20 scale-105' 
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-800'
                  }`}
                >
                  <img src={img} alt={`${product.name} - preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Actions & Selector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left w-full">
          {/* Card / Box style matching reference design */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4 mb-6">
            {/* Title & Brand */}
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                {product.brand || 'VANTA DUBAI'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {product.name}
              </h1>
            </div>

            {/* Price & Bought badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                AED {(discountPrice || product.price).toFixed(2)}
              </span>
              {isDiscounted && (
                <span className="text-sm sm:text-base font-semibold text-slate-400 dark:text-slate-500 line-through">
                  AED {product.price.toFixed(2)}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-white dark:bg-slate-700">
                Bought 2
              </span>
              {isDiscounted && discountPercent > 0 && (
                <span className="text-xs font-bold text-[#A83E68] bg-[#A83E68]/10 dark:bg-[#A83E68]/20 px-2 py-0.5 rounded border border-[#A83E68]/30">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Rating Component */}
            <div className="flex items-center gap-2 pt-1">
              <RatingComponent rating={product.rating || 4.8} size={15} />
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                ({customReviews.length} reviews)
              </span>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Sku & In Stock status */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Sku:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono font-bold tracking-wide">
                  {product.sku || `SKU-${product.id}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <span>In Stock</span>
                <RiCheckboxCircleFill className="w-4 h-4 text-[#D9A441]" />
                <span className="text-xs text-slate-400 font-normal">({product.stock || 0} available)</span>
              </div>
            </div>

            {/* Country */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200">Country:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                <span>🇦🇪</span> United Arab Emirates
              </span>
            </div>

            {/* Color selector with circular swatches and active checkmark */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Color :</span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  const isLight = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white' || color.toLowerCase() === '#fff';
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-all flex items-center justify-center relative ${
                        isSelected
                          ? 'ring-2 ring-emerald-500 ring-offset-2 scale-110 shadow-md'
                          : 'border border-slate-300 dark:border-slate-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {isSelected && (
                        <RiCheckLine
                          className={`w-4 h-4 font-black ${isLight ? 'text-emerald-600' : 'text-white'}`}
                          style={{ filter: isLight ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Size selector */}
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Standard' && (
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Size :</span>
                <div className="flex items-center gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        selectedSize === size
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Select Quantity & Order with Cash on Delivery section */}
            {product.stock > 0 ? (
              <div className="space-y-3 pt-1 w-full">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                  Select Quantity:
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  {/* Stepper + Mobile Wishlist Row */}
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    {/* Professional Neutral Stepper */}
                    <div className="h-11 sm:h-12 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 overflow-hidden flex items-center shadow-2xs">
                      <button
                        type="button"
                        onClick={handleQuantityDecrease}
                        disabled={quantity <= 1}
                        className="w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/80 active:bg-slate-300 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <RiSubtractLine className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            if (val < 1) setQuantity(1);
                            else if (val > product.stock) {
                              setQuantity(product.stock);
                              triggerToast(`Only ${product.stock} items currently in stock.`, 'warning');
                            } else {
                              setQuantity(val);
                            }
                          }
                        }}
                        className="w-12 sm:w-14 h-full bg-transparent text-slate-900 dark:text-white font-black text-center text-sm sm:text-base border-x border-slate-200/80 dark:border-slate-700/80 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleQuantityIncrease}
                        disabled={quantity >= product.stock}
                        className="w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/80 active:bg-slate-300 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <RiAddLine className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Wishlist Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="sm:hidden h-11 w-11 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-rose-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer shadow-2xs"
                      aria-label="Add to Wishlist"
                    >
                      {isWishlisted ? (
                        <RiHeartFill className="w-5 h-5 text-rose-500" />
                      ) : (
                        <RiHeartLine className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, selectedColor, selectedSize, quantity);
                    }}
                    className="w-full sm:w-auto px-5 h-12 rounded-xl border-2 border-[#35152F] dark:border-[#A83E68] text-[#35152F] dark:text-[#F7F5F1] hover:bg-[#35152F]/10 dark:hover:bg-[#A83E68]/15 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <RiShoppingBag3Line className="w-5 h-5 text-[#A83E68]" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Direct Cash on Delivery Checkout button - Full width on mobile, flex-1 on desktop */}
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, selectedColor, selectedSize, quantity);
                      navigate('/checkout');
                    }}
                    className="w-full sm:flex-1 h-12 px-5 sm:px-6 rounded-xl bg-[#35152F] hover:bg-[#A83E68] active:scale-[0.99] dark:bg-[#A83E68] dark:hover:bg-[#35152F] text-white font-black text-sm sm:text-base shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer group whitespace-nowrap"
                  >
                    <span className="w-6 h-6 rounded-md bg-[#D9A441]/20 text-[#D9A441] flex items-center justify-center shrink-0">
                      <RiHandCoinLine className="w-4 h-4" />
                    </span>
                    <span>Order with Cash on Delivery</span>
                  </button>

                  {/* Desktop Wishlist Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="hidden sm:flex h-12 w-12 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-rose-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition items-center justify-center cursor-pointer shadow-2xs"
                    aria-label="Add to Wishlist"
                  >
                    {isWishlisted ? (
                      <RiHeartFill className="w-5 h-5 text-rose-500" />
                    ) : (
                      <RiHeartLine className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full p-4 border border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/5 rounded-xl">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400 text-center">
                  This item is currently sold out ({product.stock || 0} in stock).
                </p>
              </div>
            )}
          </div>

          {/* Small Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-200/50 dark:border-slate-800/80 pt-6">
            <div className="flex items-center gap-3 text-left">
              <RiShieldCheckLine className="w-5 h-5 text-primary-600 shrink-0" />
              <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
                {product.warrantyText || '1-Year standard warranty'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <RiExchangeLine className="w-5 h-5 text-primary-600 shrink-0" />
              <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
                {product.returnPolicyText || '30-day money-back guarantee'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specs, Reviews */}
      <div className="flex flex-col gap-6 border-t border-slate-200/50 dark:border-slate-800/80 pt-10 mt-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-550'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${customReviews.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="text-left py-2 min-h-[160px]">
          {activeTab === 'description' && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              {product.description}
            </p>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(productSpecs).map(([key, val], idx) => (
                    <tr 
                      key={key} 
                      className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'bg-transparent'}
                    >
                      <td className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200/50 dark:border-slate-800 w-1/3">
                        {key}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Reviews List (7 cols) */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {customReviews.length > 0 ? (
                  customReviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {rev.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D9A441] mt-0.5">
                            <RiShieldCheckFill className="w-3.5 h-3.5 text-[#D9A441]" />
                            Verified UAE Buyer • {rev.location || 'Dubai, UAE'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 font-medium">{rev.date}</span>
                      </div>
                      <div className="mb-2.5">
                        <RatingComponent rating={rev.rating} size={13} />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-450 italic text-sm">No reviews yet. Be the first to review this product!</p>
                )}
              </div>

              {/* Add Review Form (5 cols) */}
              <div className="md:col-span-5">
                <form 
                  onSubmit={handleReviewSubmit}
                  className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex flex-col gap-4 text-left"
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Write a Review</h3>
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Your Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Rating Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Rating</label>
                    <RatingComponent
                      rating={newReview.rating}
                      interactive={true}
                      size={18}
                      onChange={(val) => setNewReview({ ...newReview, rating: val })}
                    />
                  </div>

                  {/* Comment field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Review Description</label>
                    <textarea
                      placeholder="Share your thoughts about this product..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 rounded-xl bg-[#35152F] text-white font-bold hover:bg-[#A83E68] transition-colors shadow-md mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 sm:gap-6 border-t border-slate-200/50 dark:border-slate-800/80 pt-8 sm:pt-10 mt-6 sm:mt-8">
          <div className="flex items-end justify-between">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Related Products</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Recommended items from the same category</p>
            </div>
            <Link 
              to={`/shop?category=${product.category}`} 
              className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              View Category <RiArrowRightLine />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
