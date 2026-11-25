import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products as initialProducts } from '../data/mockData';
import RatingComponent from '../components/RatingComponent';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { 
  RiHeartLine, 
  RiHeartFill, 
  RiShoppingBag3Line, 
  RiShoppingCartLine,
  RiCheckLine,
  RiCheckboxCircleFill,
  RiAddLine,
  RiSubtractLine,
  RiShieldCheckLine,
  RiExchangeLine,
  RiArrowRightLine,
  RiHandCoinLine
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

  // Gallery, options and review states
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '#000000');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Custom reviews state
  const [customReviews, setCustomReviews] = useState(product.reviews || []);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

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
    setCustomReviews(product.reviews || []);
    setNewReview({ name: '', rating: 5, comment: '' });
  }, [id, product, availableColors]);

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const discountPrice = product.discountPrice;
  const isDiscounted = discountPrice && discountPrice < product.price;
  const activePrice = discountPrice || product.price;

  // Dynamic Product Page SEO & Schema.org JSON-LD (Google Rich Results)
  useEffect(() => {
    if (!product) return;

    const prevTitle = document.title;
    document.title = `${product.name} | AeroStore Dubai`;

    let descTag = document.querySelector('meta[name="description"]');
    const prevDesc = descTag ? descTag.getAttribute('content') : '';
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', product.description ? product.description.slice(0, 160) : `${product.name} available at AeroStore UAE.`);

    // Set Product Schema JSON-LD
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images || [],
      "description": product.description || '',
      "sku": `AERO-${product.id}`,
      "mpn": `AERO-PROD-${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "AeroStore"
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
          "name": "AeroStore"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating || 4.8,
        "reviewCount": (product.reviewsCount || 10) + (customReviews?.length || 0),
        "bestRating": "5",
        "worstRating": "1"
      }
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

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      triggerToast('Please fill out all fields before submitting.', 'warning');
      return;
    }

    const reviewObj = {
      id: Date.now(),
      name: newReview.name,
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      comment: newReview.comment
    };

    setCustomReviews([reviewObj, ...customReviews]);
    triggerToast('Review submitted successfully!', 'success');
    setNewReview({ name: '', rating: 5, comment: '' });
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
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
            {product.images && product.images[activeImgIdx] ? (
              <img
                src={product.images[activeImgIdx]}
                alt={product.altText || product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-slate-400">
                <RiShoppingBag3Line className="w-16 h-16 mb-2 opacity-30 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VANTA DUBAI</span>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-slate-100 dark:bg-slate-900 cursor-pointer ${
                    idx === activeImgIdx 
                      ? 'border-primary-600 dark:border-primary-500 shadow-md' 
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-800'
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
              {isDiscounted && (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Save {product.discountPercentage}%
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
                <RiCheckboxCircleFill className="w-4 h-4 text-emerald-500" />
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
                      onClick={() => setSelectedColor(color)}
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
              <div className="space-y-3 pt-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                  Select Quantity:
                </span>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
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

                  {/* Direct Cash on Delivery Checkout button - Professional Vanta Luxury Styling */}
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, selectedColor, selectedSize, quantity);
                      navigate('/checkout');
                    }}
                    className="flex-1 h-11 sm:h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-sm sm:text-base shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 flex items-center justify-center shrink-0">
                      <RiHandCoinLine className="w-4 h-4" />
                    </span>
                    <span>Order with Cash on Delivery</span>
                  </button>

                  {/* Wishlist toggle button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="h-11 sm:h-12 w-11 sm:w-12 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-rose-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer shadow-2xs"
                    aria-label="Add to Wishlist"
                  >
                    {isWishlisted ? (
                      <RiHeartFill className="w-5 h-5 text-rose-500 animate-pulse" />
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
              <div className="md:col-span-7 flex flex-col gap-6">
                {customReviews.length > 0 ? (
                  customReviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {rev.name}
                        </p>
                        <span className="text-xs text-slate-400">{rev.date}</span>
                      </div>
                      <div className="mb-3">
                        <RatingComponent rating={rev.rating} size={12} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed leading-normal">
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
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-primary-650 transition-colors shadow-md mt-2 cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-slate-200/50 dark:border-slate-800/80 pt-10 mt-8">
          <div className="flex items-end justify-between">
            <div className="text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Related Products</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recommended items from the same category</p>
            </div>
            <Link 
              to={`/shop?category=${product.category}`} 
              className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              View Category <RiArrowRightLine />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
