import React, { createContext, useContext, useState, useEffect } from 'react';
import { coupons, products, categories as defaultCategories, testimonials as defaultTestimonials } from '../data/mockData';

const AppContext = createContext();

export const defaultHeroSlides = [
  {
    id: 1,
    title: 'AeroSound Max',
    subtitle: 'THE FUTURE OF ACOUSTICS',
    description: 'Experience pure acoustic bliss with active noise cancellation and up to 40 hours of battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    link: '/product/1',
    btnText: 'Shop Collection',
    bgColor: 'from-violet-600 to-indigo-900',
    textColor: 'text-white'
  },
  {
    id: 2,
    title: 'Minimalist Oak Chair',
    subtitle: 'HANDCRAFTED NORDIC COMFORT',
    description: 'Bring clean lines and organic warmth to your living room. FSC-certified solid European oak.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
    link: '/product/9',
    btnText: 'Shop Collection',
    bgColor: 'from-amber-600 to-amber-900',
    textColor: 'text-white'
  },
  {
    id: 3,
    title: 'Classic Leather Sneakers',
    subtitle: 'ITALIAN LEATHER ESSENTIALS',
    description: 'Crafted from premium full-grain leather, designed to fit seamlessly from the boardroom to weekends.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    link: '/product/5',
    btnText: 'Shop Collection',
    bgColor: 'from-slate-800 to-slate-950',
    textColor: 'text-white'
  }
];

export const defaultSocialLinks = [
  { id: 'facebook', platform: 'facebook', label: 'Facebook', altText: 'Follow us on Facebook', href: 'https://facebook.com', enabled: true },
  { id: 'tiktok', platform: 'tiktok', label: 'TikTok', altText: 'Follow us on TikTok', href: 'https://tiktok.com', enabled: true },
  { id: 'whatsapp', platform: 'whatsapp', label: 'WhatsApp', altText: 'Chat with us on WhatsApp', href: 'https://wa.me', enabled: true },
  { id: 'linkedin', platform: 'linkedin', label: 'LinkedIn', altText: 'Connect with us on LinkedIn', href: 'https://linkedin.com', enabled: true },
  { id: 'instagram', platform: 'instagram', label: 'Instagram', altText: 'Follow us on Instagram', href: 'https://instagram.com', enabled: false },
  { id: 'youtube', platform: 'youtube', label: 'YouTube', altText: 'Subscribe to our YouTube channel', href: 'https://youtube.com', enabled: false }
];

export const defaultPromoBanner = {
  badge: 'LIMITED TIME OFFER',
  title: 'Enjoy 20% Off Your First Purchase',
  description: 'Register your account today and use code WELCOME20 during checkout to unlock discount rates.',
  couponCode: 'WELCOME20',
  btnText: 'Claim Discount',
  btnLink: '/shop',
  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  imageAlt: 'Nike red shoe discount promotional graphic',
  bgGradient: 'from-violet-600 to-indigo-850',
  isVisible: true
};

export const defaultSeoSettings = {
  metaTitle: 'AeroStore - Handcrafted Luxury & Modern Essentials',
  metaDescription: 'Discover handcrafted luxury and modern essentials. Experience pure acoustic bliss, designer furniture, and timeless apparel.',
  metaKeywords: 'ecommerce, electronics, fashion, home living, dubai, luxury, aero store',
  siteUrl: 'https://aerostore.com',
  canonicalUrl: 'https://aerostore.com',
  ogTitle: 'AeroStore - Handcrafted Luxury & Modern Essentials',
  ogDescription: 'Discover handcrafted luxury and modern essentials. Experience pure acoustic bliss, designer furniture, and timeless apparel.',
  ogImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
  ogImageAlt: 'AeroStore UAE Luxury Essentials Collection',
  twitterCard: 'summary_large_image',
  robotsDirective: 'index, follow',
  schemaOrgName: 'AeroStore UAE',
  schemaCategory: 'OnlineStore',
  schemaCurrency: 'AED',
  schemaPhone: '+971 4 123 4567',
  schemaEmail: 'support@aerostore.com',
  schemaAddressLocality: 'Dubai',
  schemaAddressCountry: 'AE',
  pages: {
    home: {
      name: 'Home',
      path: '/',
      metaTitle: 'AeroStore - Handcrafted Luxury & Modern Essentials | Dubai, UAE',
      metaDescription: 'Shop premium acoustic headphones, handcrafted furniture, and luxury essentials in Dubai with fast UAE delivery.',
      metaKeywords: 'ecommerce, dubai luxury, electronics dubai, lifestyle, aerostore, uae',
      canonicalUrl: 'https://aerostore.com/',
      ogTitle: 'AeroStore - Handcrafted Luxury & Modern Essentials',
      ogDescription: 'Shop premium acoustic headphones, handcrafted furniture, and luxury essentials in Dubai with fast UAE delivery.',
      ogImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80'
    },
    shop: {
      name: 'Shop',
      path: '/shop',
      metaTitle: 'Shop All Products & Luxury Collections | AeroStore Dubai',
      metaDescription: 'Explore our complete catalogue of premium headphones, smart watches, luxury fashion, and designer living essentials.',
      metaKeywords: 'online shopping dubai, buy electronics uae, luxury apparel, fast delivery uae',
      canonicalUrl: 'https://aerostore.com/shop',
      ogTitle: 'Shop All Collections | AeroStore Dubai',
      ogDescription: 'Explore our complete catalogue of premium electronics, fashion, and designer living essentials.',
      ogImageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80'
    },
    about: {
      name: 'About Us',
      path: '/about',
      metaTitle: 'About AeroStore - Craftsmanship & Design Philosophy | Dubai',
      metaDescription: 'Learn about our heritage in Dubai, commitment to acoustic excellence, sustainable materials, and uncompromising luxury design.',
      metaKeywords: 'about aerostore, dubai design studio, luxury brand heritage, uae ecommerce story',
      canonicalUrl: 'https://aerostore.com/about',
      ogTitle: 'About AeroStore | Dubai Luxury Heritage',
      ogDescription: 'Learn about our heritage in Dubai, acoustic excellence, and uncompromising luxury design.',
      ogImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80'
    },
    contact: {
      name: 'Contact',
      path: '/contact',
      metaTitle: 'Contact Us & Concierge Support | AeroStore Dubai',
      metaDescription: 'Get in touch with our Dubai concierge team for product assistance, orders, corporate inquiries, or store visits.',
      metaKeywords: 'contact aerostore, customer support dubai, help center, uae concierge',
      canonicalUrl: 'https://aerostore.com/contact',
      ogTitle: 'Contact AeroStore Concierge | Dubai',
      ogDescription: 'Get in touch with our Dubai concierge team for product assistance, orders, or store visits.',
      ogImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80'
    },
    faq: {
      name: 'FAQ',
      path: '/faq',
      metaTitle: 'Frequently Asked Questions (FAQ) | AeroStore UAE',
      metaDescription: 'Find answers about order tracking, Cash on Delivery in UAE, returns, warranties, and international shipping.',
      metaKeywords: 'faq, questions, shipping uae, cash on delivery, returns policy',
      canonicalUrl: 'https://aerostore.com/faq',
      ogTitle: 'Frequently Asked Questions | AeroStore UAE',
      ogDescription: 'Find answers about order tracking, Cash on Delivery in UAE, returns, and warranties.',
      ogImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80'
    }
  },
  robotsTxt: `User-agent: *
Allow: /

# Private, account and checkout pages
Disallow: /admin
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /order-success
Disallow: /orders
Disallow: /profile
Disallow: /wishlist
Disallow: /login
Disallow: /register

# Internal search result pages
Disallow: /*?search=
Disallow: /*&search=`
};

export const defaultFeatures = [
  {
    id: 1,
    title: 'Free Shipping',
    description: 'On all orders over AED 150',
    iconPreset: 'truck',
    customSvg: '',
    customIconUrl: ''
  },
  {
    id: 2,
    title: 'Secure Payment',
    description: '100% encrypted checkout',
    iconPreset: 'shield',
    customSvg: '',
    customIconUrl: ''
  },
  {
    id: 3,
    title: '30-Day Returns',
    description: 'Hassle-free return policy',
    iconPreset: 'exchange',
    customSvg: '',
    customIconUrl: ''
  },
  {
    id: 4,
    title: '24/7 Support',
    description: 'Dedicated client assistance',
    iconPreset: 'support',
    customSvg: '',
    customIconUrl: ''
  }
];

export const AppProvider = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Auth / User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.avatar && parsed.avatar.includes('photo-1534528741775-53994a69daeb')) {
          parsed.avatar = null;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
        return parsed;
      } catch (_) {
        return null;
      }
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState(null);

  // Products state (Clean database synchronization)
  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return products || [];
  });

  // Categories state (Dynamic Store Categories)
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(c => c && !['groceries', 'sneakers', 'gaming-vr'].includes(c.id) && (c.count === undefined || Number(c.count) > 0));
          if (cleaned.length > 0) return cleaned;
        }
      } catch (_) {}
    }
    return defaultCategories.filter(c => c && !['groceries', 'sneakers', 'gaming-vr'].includes(c.id));
  });

  // Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((o) => o.orderId !== 'ORD-752183');
          if (clean.length > 0) return clean;
        }
      } catch (_) {}
    }
    return [];
  });

  // Customer Reviews / Testimonials State
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('user_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return defaultTestimonials;
  });

  const addReview = (reviewData) => {
    const newReview = {
      id: 'rev-' + Date.now(),
      name: reviewData.name?.trim() || (user?.name || 'Verified Buyer'),
      role: reviewData.role?.trim() || 'Verified Buyer',
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment?.trim() || '',
      avatar: reviewData.avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(reviewData.name || 'Buyer')}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReviews((prev) => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem('user_reviews', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    triggerToast('Thank you! Your review has been submitted successfully.', 'success');
    return newReview;
  };

  // Coupons state
  const [activeCoupon, setActiveCoupon] = useState(null);

  // Cash on Delivery Modal State
  const [codModalProduct, setCodModalProduct] = useState(null);

  const openCodModal = (product, quantity = 1, color = null, size = null) => {
    setCodModalProduct({
      ...product,
      selectedQuantity: quantity,
      selectedColor: color || (product.colors && product.colors[0]) || 'Standard',
      selectedSize: size || (product.sizes && product.sizes[0]) || 'Standard'
    });
  };

  const closeCodModal = () => {
    setCodModalProduct(null);
  };

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Toast trigger function
  const triggerToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sync cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync user
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Silent Auth Verification & Session Refresh Helper
  const silentRefresh = async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.accessToken) setAccessToken(data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.accessToken;
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  // 1. Session Refresh on Mount + Proactive Keep-Alive Heartbeat + Tab Focus Listener
  useEffect(() => {
    // Initial mount check
    silentRefresh();

    // Proactive refresh every 10 minutes to prevent 15m access token expiry while working
    const heartbeatTimer = setInterval(() => {
      silentRefresh();
    }, 10 * 60 * 1000);

    // Refresh immediately when user switches back to this tab after hours / inactive period
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        silentRefresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Universal authenticated fetch wrapper with automatic 401 retry
  const authFetch = async (url, options = {}) => {
    const defaultHeaders = {};
    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
    const finalOptions = {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    let response = await fetch(url, finalOptions);

    // If access token expired (401), automatically silent refresh and retry request
    if (response.status === 401) {
      const newToken = await silentRefresh();
      if (newToken) {
        finalOptions.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, finalOptions);
      }
    }
    return response;
  };

  // Sync orders
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Fetch orders from backend database API & sync
  const fetchOrdersFromApi = async () => {
    try {
      const res = await (authFetch ? authFetch('/api/orders') : fetch('/api/orders', { credentials: 'include' }));
      if (!res.ok) return;
      const text = await res.text();
      if (!text || !text.trim()) return;
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        return;
      }
      if (data.success && Array.isArray(data.orders)) {
        const formattedApiOrders = data.orders.map((ord) => ({
          ...ord,
          orderId: ord.orderId || ord.id,
          totals: ord.totals || {
            total: Number(ord.totalAmount || 0),
            subtotal: Number(ord.totalAmount || 0),
            shipping: 0,
            discount: 0,
            tax: 0
          },
          shippingDetails: ord.shippingDetails || {
            fullName: ord.customerName || 'Valued Customer',
            street: ord.shippingAddress || 'Dubai, UAE',
            city: 'Dubai',
            state: 'Dubai',
            zip: '00000',
            country: 'United Arab Emirates',
            email: ord.customerEmail || '',
            phone: ord.customerPhone || ''
          },
          items: ord.items && Array.isArray(ord.items) ? ord.items : []
        }));

        setOrders(formattedApiOrders);
        try {
          localStorage.setItem('orders', JSON.stringify(formattedApiOrders));
        } catch (_) {}
        return formattedApiOrders;
      }
    } catch (e) {
      console.warn('Error fetching orders from backend:', e);
    }
  };

  useEffect(() => {
    fetchOrdersFromApi();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrdersFromApi();
    }
  }, [user]);

  // Sync products
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(productsList));
  }, [productsList]);

  // Store Branding & Logo State
  const [storeLogo, setStoreLogo] = useState(() => {
    return localStorage.getItem('storeLogo') || null;
  });

  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem('storeName') || 'AEROSTORE';
  });

  const [showLogoText, setShowLogoText] = useState(() => {
    const saved = localStorage.getItem('showLogoText');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Hero Section Slides State
  const [heroSlides, setHeroSlides] = useState(() => {
    const saved = localStorage.getItem('heroSlides');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return defaultHeroSlides;
  });

  // SEO / Meta Settings State
  const [seoSettings, setSeoSettings] = useState(() => {
    const saved = localStorage.getItem('seoSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.metaTitle) {
          return {
            ...defaultSeoSettings,
            ...parsed,
            pages: { ...defaultSeoSettings.pages, ...(parsed.pages || {}) }
          };
        }
      } catch (_) {}
    }
    return defaultSeoSettings;
  });

  // Promotional Banner State (Controlled via Admin)
  const [promoBanner, setPromoBanner] = useState(() => {
    const saved = localStorage.getItem('promoBanner');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...defaultPromoBanner, ...parsed };
      } catch (_) {}
    }
    return defaultPromoBanner;
  });

  useEffect(() => {
    localStorage.setItem('promoBanner', JSON.stringify(promoBanner));
  }, [promoBanner]);

  // Dynamic DOM Meta Tag & Schema Graph Sync
  useEffect(() => {
    if (!seoSettings) return;

    // 1. Page Title
    if (seoSettings.metaTitle) {
      document.title = seoSettings.metaTitle;
    }

    // Helper to create or update meta tag
    const setMetaTag = (attrName, attrVal, contentVal) => {
      if (!contentVal) return;
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    // 2. Standard Search Meta Tags
    setMetaTag('name', 'description', seoSettings.metaDescription);
    setMetaTag('name', 'keywords', seoSettings.metaKeywords);
    setMetaTag('name', 'robots', seoSettings.robotsDirective || 'index, follow');

    // 3. OpenGraph Social Sharing Tags
    const effectiveSiteUrl = seoSettings.siteUrl || 'https://aerostore.com';
    const effectiveCanonical = seoSettings.canonicalUrl || effectiveSiteUrl;
    const effectiveOgTitle = seoSettings.ogTitle || seoSettings.metaTitle;
    const effectiveOgDesc = seoSettings.ogDescription || seoSettings.metaDescription;
    const effectiveOgImg = seoSettings.ogImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80';

    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', seoSettings.schemaOrgName || storeName || 'AeroStore');
    setMetaTag('property', 'og:title', effectiveOgTitle);
    setMetaTag('property', 'og:description', effectiveOgDesc);
    setMetaTag('property', 'og:url', effectiveCanonical);
    setMetaTag('property', 'og:image', effectiveOgImg);
    setMetaTag('property', 'og:image:alt', seoSettings.ogImageAlt || effectiveOgTitle);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', seoSettings.twitterCard || 'summary_large_image');
    setMetaTag('name', 'twitter:title', effectiveOgTitle);
    setMetaTag('name', 'twitter:description', effectiveOgDesc);
    setMetaTag('name', 'twitter:image', effectiveOgImg);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', effectiveCanonical);

    // 6. Schema.org JSON-LD Structured Graph
    const schemaGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${effectiveSiteUrl}/#website`,
          "url": effectiveSiteUrl,
          "name": seoSettings.schemaOrgName || storeName || "AeroStore",
          "description": seoSettings.metaDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${effectiveSiteUrl}/shop?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": seoSettings.schemaCategory || "OnlineStore",
          "@id": `${effectiveSiteUrl}/#organization`,
          "name": seoSettings.schemaOrgName || storeName || "AeroStore",
          "url": effectiveSiteUrl,
          "logo": storeLogo || `${effectiveSiteUrl}/favicon.svg`,
          "image": effectiveOgImg,
          "description": seoSettings.metaDescription,
          "telephone": seoSettings.schemaPhone || "+971 4 123 4567",
          "email": seoSettings.schemaEmail || "support@aerostore.com",
          "currenciesAccepted": seoSettings.schemaCurrency || "AED",
          "priceRange": "AED 50 - AED 2500",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": seoSettings.schemaAddressLocality || "Dubai",
            "addressCountry": seoSettings.schemaAddressCountry || "AE"
          }
        }
      ]
    };

    let schemaScript = document.getElementById('aerostore-schema-graph');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('id', 'aerostore-schema-graph');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaGraph, null, 2);

    localStorage.setItem('seoSettings', JSON.stringify(seoSettings));
  }, [seoSettings, storeName, storeLogo]);

  // Sync hero slides to localStorage
  useEffect(() => {
    localStorage.setItem('heroSlides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  // Features / Brand Value Grid State
  const [features, setFeatures] = useState(() => {
    const saved = localStorage.getItem('features');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return defaultFeatures;
  });

  useEffect(() => {
    localStorage.setItem('features', JSON.stringify(features));
  }, [features]);

  // Social Links State (Footer & Admin controlled)
  const [socialLinks, setSocialLinks] = useState(() => {
    const saved = localStorage.getItem('socialLinks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out twitter if old cache had it
          return parsed.filter((s) => s.platform !== 'twitter' && s.id !== 'twitter');
        }
      } catch (_) {}
    }
    return defaultSocialLinks;
  });

  useEffect(() => {
    localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
  }, [socialLinks]);

  // Sync settings with backend
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.logoUrl) {
            setStoreLogo(data.settings.logoUrl);
            localStorage.setItem('storeLogo', data.settings.logoUrl);
          }
          if (data.settings.storeName) {
            setStoreName(data.settings.storeName);
            localStorage.setItem('storeName', data.settings.storeName);
          }
          if (typeof data.settings.showLogoText === 'boolean') {
            setShowLogoText(data.settings.showLogoText);
            localStorage.setItem('showLogoText', JSON.stringify(data.settings.showLogoText));
          }
          if (data.settings.heroSlides && Array.isArray(data.settings.heroSlides)) {
            setHeroSlides(data.settings.heroSlides);
            localStorage.setItem('heroSlides', JSON.stringify(data.settings.heroSlides));
          }
          if (data.settings.seo && data.settings.seo.metaTitle) {
            setSeoSettings(data.settings.seo);
            localStorage.setItem('seoSettings', JSON.stringify(data.settings.seo));
          }
          if (data.settings.features && Array.isArray(data.settings.features)) {
            setFeatures(data.settings.features);
            localStorage.setItem('features', JSON.stringify(data.settings.features));
          }
          if (data.settings.promoBanner && typeof data.settings.promoBanner === 'object') {
            setPromoBanner(data.settings.promoBanner);
            localStorage.setItem('promoBanner', JSON.stringify(data.settings.promoBanner));
          }
          if (data.settings.socialLinks && Array.isArray(data.settings.socialLinks)) {
            const sanitized = data.settings.socialLinks.filter((s) => s.platform !== 'twitter' && s.id !== 'twitter');
            setSocialLinks(sanitized);
            localStorage.setItem('socialLinks', JSON.stringify(sanitized));
          }
          if (data.settings.products && Array.isArray(data.settings.products) && data.settings.products.length > 0) {
            setProductsList(data.settings.products);
            localStorage.setItem('products', JSON.stringify(data.settings.products));
          }
        }
      })
      .catch(() => {
        // Offline / fallback to localStorage
      });

    // Fetch categories from backend database
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const cleaned = data.categories.filter(c => c && !['groceries', 'sneakers', 'gaming-vr'].includes(c.id) && (c.count === undefined || Number(c.count) > 0));
          setCategories(cleaned);
          localStorage.setItem('categories', JSON.stringify(cleaned));
        }
      })
      .catch(() => {});

    // Fetch products directly from MySQL database (with storage paths)
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProductsList(data.products);
          localStorage.setItem('products', JSON.stringify(data.products));
        }
      })
      .catch(() => {});
  }, []);

  const uploadCategoryImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        triggerToast('Category image uploaded to storage!', 'success');
        return data.imageUrl;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addCategory = async (newCatData) => {
    const name = (newCatData.name || '').trim();
    if (!name) {
      triggerToast('Category name is required', 'warning');
      return null;
    }
    const catId = newCatData.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory = {
      id: catId,
      name,
      icon: newCatData.icon || 'RiShoppingBagLine',
      image: newCatData.image || '',
      description: newCatData.description || `${name} collection.`,
      count: 0
    };

    setCategories((prev) => {
      const updated = [...prev.filter((c) => c.id !== catId), newCategory];
      try {
        localStorage.setItem('categories', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
    } catch (_) {}

    triggerToast(`Category "${name}" added successfully!`, 'success');
    return newCategory;
  };

  const deleteCategory = async (catId) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== catId);
      try {
        localStorage.setItem('categories', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    try {
      await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
    } catch (_) {}

    triggerToast('Category deleted.', 'info');
  };

  const updateCategory = async (catId, updatedFields) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === catId ? { ...c, ...updatedFields } : c));
      try {
        localStorage.setItem('categories', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: catId, ...updatedFields })
      });
    } catch (_) {}

    triggerToast('Category updated successfully!', 'success');
  };

  // Contact Info State (Manageable via Super Admin)
  const defaultContactInfo = {
    supportEmail: 'support@aerostore.com',
    phoneHotline: '+971 4 123 4567',
    officeAddress: 'Downtown Dubai, Boulevard Plaza Tower 1, Level 14, Dubai, UAE',
    operationHours: 'Monday – Saturday: 9:00 AM – 8:00 PM (GST)'
  };

  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem('contactInfo');
    if (saved) {
      try {
        return { ...defaultContactInfo, ...JSON.parse(saved) };
      } catch (_) {}
    }
    return defaultContactInfo;
  });

  const updateContactInfo = (newInfo) => {
    setContactInfo((prev) => {
      const updated = { ...prev, ...newInfo };
      localStorage.setItem('contactInfo', JSON.stringify(updated));
      return updated;
    });
    triggerToast('Contact details updated successfully!', 'success');
  };

  // Contact Messages / Inquiries State (Routed to Super Admin)
  const [contactMessages, setContactMessages] = useState(() => {
    const saved = localStorage.getItem('contactMessages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [
      {
        id: 'MSG-101',
        name: 'Mohammed Al-Falasi',
        email: 'mohammed.falasi@example.ae',
        subject: 'Bulk Luxury Order Inquiry',
        message: 'Looking to purchase 15 units of AeroSound Max for our Dubai office executive suite. Can you provide custom invoices?',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  });

  const submitContactMessage = (msgData) => {
    const newMsg = {
      id: 'MSG-' + Date.now(),
      name: msgData.name || '',
      email: msgData.email || '',
      subject: msgData.subject || 'Customer Inquiry',
      message: msgData.message || '',
      createdAt: new Date().toISOString()
    };
    setContactMessages((prev) => {
      const updated = [newMsg, ...prev];
      localStorage.setItem('contactMessages', JSON.stringify(updated));
      return updated;
    });
    triggerToast('Thank you! Your message has been sent to our Super Admin.', 'success');
    return newMsg;
  };

  const deleteContactMessage = (msgId) => {
    setContactMessages((prev) => {
      const updated = prev.filter((m) => m.id !== msgId);
      localStorage.setItem('contactMessages', JSON.stringify(updated));
      return updated;
    });
    triggerToast('Message deleted.', 'info');
  };

  const uploadLogo = async (file) => {
    if (!file) return;

    // Try backend upload
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success && data.logoUrl) {
        setStoreLogo(data.logoUrl);
        localStorage.setItem('storeLogo', data.logoUrl);
        triggerToast('Logo uploaded to server successfully!', 'success');
        return data.logoUrl;
      } else {
        throw new Error(data.message || 'Server upload failed');
      }
    } catch (_) {
      // Fallback: Local Base64 conversion
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          setStoreLogo(base64data);
          localStorage.setItem('storeLogo', base64data);
          triggerToast('Logo updated successfully!', 'success');
          resolve(base64data);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resetLogo = async () => {
    try {
      await fetch('/api/settings/logo', { method: 'DELETE' });
    } catch (_) {}
    setStoreLogo(null);
    localStorage.removeItem('storeLogo');
    triggerToast('Logo reset to default.', 'info');
  };

  const updateStoreName = async (name) => {
    setStoreName(name);
    localStorage.setItem('storeName', name);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName: name })
      });
    } catch (_) {}
    triggerToast('Store name updated!', 'success');
  };

  const toggleShowLogoText = async (val) => {
    setShowLogoText(val);
    localStorage.setItem('showLogoText', JSON.stringify(val));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showLogoText: val })
      });
    } catch (_) {}
  };

  // Hero & SEO operations
  const updateHeroSlide = (slideId, updatedFields) => {
    setHeroSlides((prev) => {
      const next = prev.map((s) => (s.id === slideId ? { ...s, ...updatedFields } : s));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroSlides: next })
        });
      } catch (_) {}
      return next;
    });
    triggerToast('Hero slide updated!', 'success');
  };

  const addHeroSlide = (newSlide = {}) => {
    const slideWithId = {
      id: Date.now(),
      title: newSlide.title || 'New Highlight Banner',
      subtitle: newSlide.subtitle || 'EXCLUSIVE COLLECTION',
      description: newSlide.description || 'Add an attractive description here.',
      image: newSlide.image || '',
      link: newSlide.link || '/shop',
      btnText: newSlide.btnText || 'Shop Collection',
      bgColor: newSlide.bgColor || 'from-violet-600 to-indigo-900',
      textColor: 'text-white'
    };
    setHeroSlides((prev) => {
      const next = [...prev, slideWithId];
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroSlides: next })
        });
      } catch (_) {}
      return next;
    });
    triggerToast('New slide added to Hero section!', 'success');
    return slideWithId;
  };

  const deleteHeroSlide = (slideId) => {
    setHeroSlides((prev) => {
      if (prev.length <= 1) {
        triggerToast('At least one slide must remain.', 'warning');
        return prev;
      }
      const next = prev.filter((s) => s.id !== slideId);
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroSlides: next })
        });
      } catch (_) {}
      triggerToast('Slide deleted.', 'info');
      return next;
    });
  };

  const resetHeroSlides = () => {
    setHeroSlides(defaultHeroSlides);
    localStorage.setItem('heroSlides', JSON.stringify(defaultHeroSlides));
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroSlides: defaultHeroSlides })
      });
    } catch (_) {}
    triggerToast('Hero slides reset to default.', 'info');
  };

  const updateSeoSettings = (newSeo) => {
    setSeoSettings((prev) => {
      const next = { ...prev, ...newSeo };
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seo: next })
        });
      } catch (_) {}
      return next;
    });
    triggerToast('SEO, OpenGraph & Schema settings saved successfully!', 'success');
  };

  const updatePageSeo = (pageKey, pageSeoData) => {
    setSeoSettings((prev) => {
      const currentPages = prev.pages || defaultSeoSettings.pages;
      const updatedPages = {
        ...currentPages,
        [pageKey]: {
          ...(currentPages[pageKey] || {}),
          ...pageSeoData
        }
      };
      const next = {
        ...prev,
        pages: updatedPages
      };
      localStorage.setItem('seoSettings', JSON.stringify(next));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seo: next })
        });
      } catch (_) {}
      return next;
    });
    const pageDisplayName = (prev) => {
      const names = { home: 'Home', shop: 'Shop', about: 'About', contact: 'Contact', faq: 'FAQ' };
      return names[pageKey] || pageKey.toUpperCase();
    };
    triggerToast(`SEO for "${pageKey.toUpperCase()}" page updated!`, 'success');
  };

  const updatePromoBanner = (updates) => {
    setPromoBanner((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('promoBanner', JSON.stringify(next));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promoBanner: next })
        });
      } catch (_) {}
      return next;
    });
    triggerToast('Promotional banner updated successfully!', 'success');
  };

  const uploadPromoImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/settings/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        triggerToast('Promo banner image uploaded!', 'success');
        return data.imageUrl;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resetPromoBanner = () => {
    setPromoBanner(defaultPromoBanner);
    localStorage.setItem('promoBanner', JSON.stringify(defaultPromoBanner));
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoBanner: defaultPromoBanner })
      });
    } catch (_) {}
    triggerToast('Promotional banner reset to default.', 'info');
  };

  const uploadOgImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/settings/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        triggerToast('OpenGraph social image uploaded!', 'success');
        return data.imageUrl;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const uploadHeroImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/settings/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        triggerToast('Slide image uploaded to server!', 'success');
        return data.imageUrl;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Features banner operations
  const updateFeature = (featureId, updatedFields) => {
    setFeatures((prev) => {
      const next = prev.map((f) => (f.id === featureId ? { ...f, ...updatedFields } : f));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features: next })
        });
      } catch (_) {}
      return next;
    });
    triggerToast('Feature banner updated!', 'success');
  };

  const resetFeatures = () => {
    setFeatures(defaultFeatures);
    localStorage.setItem('features', JSON.stringify(defaultFeatures));
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: defaultFeatures })
      });
    } catch (_) {}
    triggerToast('Features banner reset to defaults.', 'info');
  };

  const updateSocialLinks = async (nextLinks) => {
    setSocialLinks(nextLinks);
    localStorage.setItem('socialLinks', JSON.stringify(nextLinks));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: nextLinks })
      });
    } catch (_) {}
    triggerToast('Social links updated successfully!', 'success');
  };

  const resetSocialLinks = async () => {
    setSocialLinks(defaultSocialLinks);
    localStorage.setItem('socialLinks', JSON.stringify(defaultSocialLinks));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: defaultSocialLinks })
      });
    } catch (_) {}
    triggerToast('Social links reset to default.', 'info');
  };

  const uploadFeatureIcon = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/settings/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        triggerToast('Icon uploaded successfully!', 'success');
        return data.imageUrl;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Admin product operations
  const uploadProductImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/settings/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        triggerToast('Product image uploaded successfully!', 'success');
        return data.imageUrl;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addProduct = async (newProduct) => {
    const rawImage = newProduct.image || (newProduct.images && newProduct.images[0]) || '';
    const generatedId = newProduct.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('vnt-' + Date.now()));
    const catCode = (newProduct.category || 'GEN').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'GEN';
    const generatedSku = (newProduct.sku && newProduct.sku.trim())
      ? newProduct.sku.trim().toUpperCase()
      : `VNT-${catCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    const productWithId = {
      ...newProduct,
      id: generatedId,
      sku: generatedSku,
      rating: newProduct.rating || 5.0,
      reviewsCount: newProduct.reviewsCount || 0,
      isFeatured: !!newProduct.isFeatured,
      isBestSeller: !!newProduct.isBestSeller,
      isNewArrival: typeof newProduct.isNewArrival === 'boolean' ? newProduct.isNewArrival : true,
      image: rawImage,
      images: rawImage ? [rawImage] : []
    };
    setProductsList((prev) => {
      const next = [productWithId, ...prev];
      localStorage.setItem('products', JSON.stringify(next));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: next })
        });
      } catch (_) {}
      return next;
    });

    // Persist directly into MySQL products table
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithId)
      });
    } catch (_) {}

    triggerToast(`Product "${productWithId.name}" (${generatedSku}) added successfully!`, 'success');
    return productWithId;
  };

  const updateProduct = async (productId, updatedFields) => {
    setProductsList((prev) => {
      const next = prev.map((p) => (String(p.id) === String(productId) ? { ...p, ...updatedFields } : p));
      localStorage.setItem('products', JSON.stringify(next));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: next })
        });
      } catch (_) {}
      return next;
    });

    // Update in MySQL products table
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (_) {}

    triggerToast('Product updated successfully!', 'success');
  };

  const toggleProductBadge = (productId, badgeKey) => {
    setProductsList((prev) => {
      let updatedName = '';
      let newState = false;
      const next = prev.map((p) => {
        if (String(p.id) === String(productId)) {
          updatedName = p.name;
          newState = !p[badgeKey];
          return { ...p, [badgeKey]: newState };
        }
        return p;
      });
      localStorage.setItem('products', JSON.stringify(next));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: next })
        });
      } catch (_) {}
      const badgeLabel =
        badgeKey === 'isFeatured'
          ? 'Featured'
          : badgeKey === 'isBestSeller'
          ? 'Best Seller'
          : 'New Arrival';
      triggerToast(
        `${badgeLabel} ${newState ? 'ON' : 'OFF'} for "${updatedName}"`,
        newState ? 'success' : 'info'
      );
      return next;
    });
  };

  const deleteProduct = async (productId) => {
    setProductsList((prev) => {
      const next = prev.filter((p) => String(p.id) !== String(productId));
      localStorage.setItem('products', JSON.stringify(next));
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: next })
        });
      } catch (_) {}
      return next;
    });

    // Delete from MySQL products table
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    } catch (_) {}

    triggerToast('Product deleted.', 'info');
  };

  const clearAllProducts = async () => {
    try {
      await fetch('/api/products', { method: 'DELETE' });
    } catch (_) {}
    setProductsList([]);
    try {
      localStorage.setItem('products', JSON.stringify([]));
    } catch (_) {}
    triggerToast('All dummy products removed successfully.', 'success');
  };

  const fetchProductsFromApi = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProductsList(data.products);
        try {
          localStorage.setItem('products', JSON.stringify(data.products));
        } catch (_) {}
        return data.products;
      }
    } catch (_) {}
    return [];
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? { ...ord, status: newStatus } : ord))
    );
    try {
      await (authFetch ? authFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }) : fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }));
    } catch (_) {}
    triggerToast(`Order ${orderId} updated to ${newStatus}`, 'success');
  };

  // Cart operations
  const addToCart = (product, color, size, quantity = 1) => {
    const selectedColor = color || (product.colors && product.colors[0]) || 'Standard';
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}`;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.stock) {
          triggerToast(`Cannot add more. Only ${product.stock} items in stock.`, 'warning');
          return prevCart;
        }

        updatedCart[existingItemIndex].quantity = newQuantity;
        triggerToast(`Updated ${product.name} quantity in your cart!`, 'success');
        return updatedCart;
      } else {
        if (quantity > product.stock) {
          triggerToast(`Only ${product.stock} items in stock.`, 'warning');
          return prevCart;
        }
        triggerToast(`${product.name} added to your cart!`, 'success');
        return [...prevCart, {
          cartItemId,
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          discountPrice: product.discountPrice,
          image: product.images[0],
          color: selectedColor,
          size: selectedSize,
          quantity,
          stock: product.stock
        }];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.cartItemId === cartItemId);
      if (item) {
        triggerToast(`${item.name} removed from your cart.`, 'info');
      }
      return prevCart.filter((i) => i.cartItemId !== cartItemId);
    });
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          if (newQuantity > item.stock) {
            triggerToast(`Sorry, only ${item.stock} units available in stock.`, 'warning');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const applyCoupon = (code) => {
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      triggerToast('Invalid coupon code.', 'error');
      return false;
    }
    
    const subtotal = getCartSubtotal();
    if (subtotal < coupon.minSpend) {
      triggerToast(`Coupon requires a minimum purchase of AED ${coupon.minSpend}.`, 'warning');
      return false;
    }

    setActiveCoupon(coupon);
    triggerToast(`Coupon "${coupon.code}" applied!`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    triggerToast('Coupon removed.', 'info');
  };

  // Cart helper calculations
  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);
  
  const getCartSubtotal = () => cart.reduce((total, item) => {
    const activePrice = item.discountPrice || item.price;
    return total + activePrice * item.quantity;
  }, 0);

  const getCartDiscount = () => {
    if (!activeCoupon) return 0;
    const subtotal = getCartSubtotal();
    if (activeCoupon.discountType === 'percentage') {
      return (subtotal * activeCoupon.value) / 100;
    } else if (activeCoupon.discountType === 'fixed') {
      return activeCoupon.value;
    }
    return 0;
  };

  const getShippingCost = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 150 ? 0 : 15.00; // Free shipping over $150
  };

  const getTaxAmount = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    return Math.max(0, (subtotal - discount) * 0.08); // 8% sales tax
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const shipping = getShippingCost();
    const tax = getTaxAmount();
    return Math.max(0, subtotal - discount + shipping + tax);
  };

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const isAlreadyIn = prevWishlist.some((item) => item.id === product.id);
      if (isAlreadyIn) {
        triggerToast(`${product.name} removed from your wishlist.`, 'info');
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        triggerToast(`${product.name} added to your wishlist!`, 'success');
        return [...prevWishlist, {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          discountPrice: product.discountPrice,
          image: product.images[0],
          rating: product.rating,
          stock: product.stock
        }];
      }
    });
  };

  // Registered Users list from localStorage (sync for local authentication)
  const getRegisteredUsers = () => {
    try {
      const saved = localStorage.getItem('registeredUsers');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  };

  const saveRegisteredUser = (userData) => {
    try {
      const users = getRegisteredUsers();
      const updated = [...users.filter((u) => u.email.toLowerCase() !== userData.email.toLowerCase()), userData];
      localStorage.setItem('registeredUsers', JSON.stringify(updated));
    } catch (_) {}
  };

  // Authentication operations with SQLite Backend
  const login = async (email, password) => {
    if (!email || !password) {
      triggerToast('Email and password are required.', 'warning');
      return false;
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Authenticate with Backend API (Sets httpOnly refreshToken cookie)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        if (data.accessToken) setAccessToken(data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        triggerToast(data.message || 'Logged in successfully!', 'success');
        return true;
      } else {
        triggerToast(data.message || 'Invalid email or password.', 'error');
        return false;
      }
    } catch (_) {
      // 2. Offline / Local Fallback: ONLY verify against actually registered accounts or official admins!
      if (normalizedEmail === 'superadmin@gmail.com') {
        if (password !== 'password123') {
          triggerToast('Incorrect password for Super Admin.', 'error');
          return false;
        }
        const superAdminUser = {
          id: 1,
          name: 'Super Administrator',
          email: 'superadmin@gmail.com',
          role: 'superadmin',
          phone: '+971 50 123 4567',
          avatar: null,
          joinedDate: 'January 2026',
          addresses: [
            {
              id: 'addr_super_1',
              street: 'Downtown Dubai, Boulevard Plaza Tower 1',
              city: 'Dubai',
              state: 'Dubai',
              zip: '00000',
              country: 'United Arab Emirates',
              isDefault: true
            }
          ]
        };
        setUser(superAdminUser);
        localStorage.setItem('user', JSON.stringify(superAdminUser));
        triggerToast('Welcome back, Super Administrator!', 'success');
        return true;
      }

      if (normalizedEmail === 'admin@aerostore.com') {
        if (password !== 'admin123') {
          triggerToast('Incorrect password for Administrator.', 'error');
          return false;
        }
        const adminUser = {
          id: 2,
          name: 'Store Administrator',
          email: 'admin@aerostore.com',
          role: 'admin',
          phone: '+971 4 999 0000',
          avatar: null,
          joinedDate: 'January 2026',
          addresses: []
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        triggerToast('Welcome back, Administrator!', 'success');
        return true;
      }

      // Check registered users in storage
      const registered = getRegisteredUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!registered) {
        triggerToast('Account does not exist. Please sign up first.', 'error');
        return false;
      }

      if (registered.password !== password) {
        triggerToast('Incorrect password. Please try again.', 'error');
        return false;
      }

      const { password: _pwd, ...safeUser } = registered;
      setUser(safeUser);
      localStorage.setItem('user', JSON.stringify(safeUser));
      triggerToast(`Welcome back, ${safeUser.name}!`, 'success');
      return true;
    }
  };

  const register = async (fullName, email, phone, password) => {
    if (!fullName || !email || !password) {
      triggerToast('All required fields must be filled.', 'warning');
      return false;
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered locally
    const existingLocally = getRegisteredUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingLocally) {
      triggerToast('An account with this email already exists. Please sign in.', 'error');
      return false;
    }

    // 1. Register with Backend API (Sets httpOnly refreshToken cookie)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: fullName, email: normalizedEmail, phone, password })
      });
      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        if (data.accessToken) setAccessToken(data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        saveRegisteredUser({ name: fullName, email: normalizedEmail, phone, password, role: data.user.role || 'customer' });
        triggerToast(data.message || 'Account registered successfully!', 'success');
        return true;
      } else {
        triggerToast(data.message || 'Registration failed.', 'error');
        return false;
      }
    } catch (_) {
      // 2. Offline / Local fallback: Save user to registeredUsers
      const isSuper = normalizedEmail === 'superadmin@gmail.com';
      const isAdmin = isSuper || normalizedEmail.includes('admin');
      const newUser = {
        id: 'usr_' + Date.now(),
        name: fullName,
        email: normalizedEmail,
        password: password,
        role: isSuper ? 'superadmin' : isAdmin ? 'admin' : 'customer',
        phone: phone || '',
        avatar: null,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        addresses: []
      };
      saveRegisteredUser(newUser);
      const { password: _newPwd, ...safeUser } = newUser;
      setUser(safeUser);
      localStorage.setItem('user', JSON.stringify(safeUser));
      triggerToast('Account registered successfully! Welcome to VANTA DUBAI.', 'success');
      return true;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (_) {}
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    setCart([]);
    setWishlist([]);
    setActiveCoupon(null);
    triggerToast('Logged out successfully.', 'info');
  };

  const updateProfile = (updatedData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      triggerToast('Profile updated!', 'success');
      return { ...prevUser, ...updatedData };
    });
  };

  // Checkout / Create Order (Supports cart orders and direct Cash on Delivery modal orders)
  const createOrder = async (shippingDetails, paymentMethod, directItems = null, customTotal = null) => {
    const isDirectOrder = Array.isArray(directItems) && directItems.length > 0;
    const orderItems = isDirectOrder ? directItems : [...cart];

    let subtotalVal = 0;
    let shippingVal = 0;
    let taxVal = 0;
    let discountVal = 0;
    let finalTotalVal = 0;

    if (isDirectOrder) {
      subtotalVal = orderItems.reduce((acc, item) => {
        const p = item.discountPrice || item.price || 0;
        return acc + p * (item.quantity || 1);
      }, 0);
      shippingVal = subtotalVal > 150 ? 0 : 15.00;
      taxVal = 0;
      discountVal = 0;
      finalTotalVal = customTotal !== null ? customTotal : (subtotalVal + shippingVal);
    } else {
      subtotalVal = getCartSubtotal();
      shippingVal = getShippingCost();
      taxVal = getTaxAmount();
      discountVal = getCartDiscount();
      finalTotalVal = getCartTotal();
    }

    const newOrder = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: orderItems,
      totals: {
        subtotal: subtotalVal,
        discount: discountVal,
        shipping: shippingVal,
        tax: taxVal,
        total: finalTotalVal
      },
      shippingDetails,
      paymentMethod,
      status: 'Processing'
    };

    setOrders((prevOrders) => {
      const updated = [newOrder, ...prevOrders];
      try {
        localStorage.setItem('orders', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (!isDirectOrder) {
      setCart([]);
      setActiveCoupon(null);
    }

    // Sync order to backend database with auto-refresh protection (401 retry)
    try {
      await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.orderId,
          userId: user?.id || null,
          customerName: shippingDetails.fullName || user?.name || 'Customer',
          customerEmail: shippingDetails.email || user?.email || '',
          customerPhone: shippingDetails.phone || user?.phone || '',
          shippingAddress: `${shippingDetails.street || ''}, ${shippingDetails.area || shippingDetails.city || ''}, ${shippingDetails.emirate || shippingDetails.state || ''} ${shippingDetails.country || 'United Arab Emirates'}`.trim(),
          items: newOrder.items,
          totalAmount: newOrder.totals.total,
          currency: 'AED',
          paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : (paymentMethod?.method || 'Cash on Delivery'),
          paymentStatus: (typeof paymentMethod === 'string' ? paymentMethod : paymentMethod?.method) === 'Cash on Delivery'
            ? 'Pending (Pay upon arrival)'
            : 'Paid',
          orderStatus: 'Processing',
          shippingDetails,
          totals: newOrder.totals
        })
      }).catch(() => {});
    } catch (_) {}

    triggerToast('Order placed successfully!', 'success');
    return newOrder.orderId;
  };

  const currency = 'AED';
  const formatPrice = (amount) => `AED ${Number(amount || 0).toFixed(2)}`;

  return (
    <AppContext.Provider
      value={{
        currency,
        formatPrice,
        darkMode,
        setDarkMode,
        productsList,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        uploadCategoryImage,
        contactInfo,
        updateContactInfo,
        contactMessages,
        submitContactMessage,
        deleteContactMessage,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        fetchProductsFromApi,
        toggleProductBadge,
        uploadProductImage,
        updateOrderStatus,
        storeLogo,
        storeName,
        uploadLogo,
        resetLogo,
        updateStoreName,
        heroSlides,
        updateHeroSlide,
        addHeroSlide,
        deleteHeroSlide,
        resetHeroSlides,
        uploadHeroImage,
        seoSettings,
        updateSeoSettings,
        updatePageSeo,
        uploadOgImage,
        promoBanner,
        updatePromoBanner,
        uploadPromoImage,
        resetPromoBanner,
        features,
        updateFeature,
        resetFeatures,
        uploadFeatureIcon,
        socialLinks,
        updateSocialLinks,
        resetSocialLinks,
        defaultSocialLinks,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        wishlist,
        toggleWishlist,
        user,
        accessToken,
        silentRefresh,
        authFetch,
        login,
        register,
        logout,
        updateProfile,
        orders,
        fetchOrdersFromApi,
        createOrder,
        reviews,
        addReview,
        codModalProduct,
        openCodModal,
        closeCodModal,
        toasts,
        triggerToast,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        getCartCount,
        getCartSubtotal,
        getCartDiscount,
        getShippingCost,
        getTaxAmount,
        getCartTotal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
