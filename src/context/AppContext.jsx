import React, { createContext, useContext, useState, useEffect } from 'react';
import { coupons, products } from '../data/mockData';

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

export const defaultSeoSettings = {
  metaTitle: 'AeroStore - Handcrafted Luxury & Modern Essentials',
  metaDescription: 'Discover handcrafted luxury and modern essentials. Experience pure acoustic bliss, designer furniture, and timeless apparel.',
  metaKeywords: 'ecommerce, electronics, fashion, home living, dubai, luxury, aero store'
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
    return saved ? JSON.parse(saved) : null;
  });

  // Products state
  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : products;
  });

  // Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return [
      {
        orderId: 'ORD-894210',
        date: 'November 10, 2026',
        items: [
          {
            id: 1,
            name: 'AeroSound Max Wireless Headphones',
            price: 249.99,
            quantity: 1,
            color: '#000000',
            size: 'Standard',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
          }
        ],
        totals: {
          subtotal: 249.99,
          discount: 0,
          shipping: 0,
          tax: 20.00,
          total: 269.99
        },
        shippingDetails: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+1 (555) 019-2834',
          address: '128 Pine Street, Suite 400',
          city: 'San Francisco',
          country: 'United States'
        },
        paymentMethod: 'Credit Card',
        status: 'Shipped'
      },
      {
        orderId: 'ORD-752183',
        date: 'November 11, 2026',
        items: [
          {
            id: 2,
            name: 'Apex Runner Pro Athletic Sneakers',
            price: 139.99,
            quantity: 2,
            color: '#1E293B',
            size: 'US 10',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
          }
        ],
        totals: {
          subtotal: 279.98,
          discount: 25.00,
          shipping: 0,
          tax: 20.40,
          total: 275.38
        },
        shippingDetails: {
          firstName: 'Alex',
          lastName: 'Morgan',
          email: 'alex.m@example.com',
          phone: '+1 (555) 234-5678',
          address: '452 Broadway Ave',
          city: 'New York',
          country: 'United States'
        },
        paymentMethod: 'PayPal',
        status: 'Processing'
      }
    ];
  });

  // Coupons state
  const [activeCoupon, setActiveCoupon] = useState(null);

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
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Sync orders
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

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
        if (parsed && parsed.metaTitle) return parsed;
      } catch (_) {}
    }
    return defaultSeoSettings;
  });

  // Dynamic DOM Meta Tag Sync
  useEffect(() => {
    if (seoSettings?.metaTitle) {
      document.title = seoSettings.metaTitle;
    }
    if (seoSettings?.metaDescription) {
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', seoSettings.metaDescription);
    }
    if (seoSettings?.metaKeywords) {
      let kwTag = document.querySelector('meta[name="keywords"]');
      if (!kwTag) {
        kwTag = document.createElement('meta');
        kwTag.setAttribute('name', 'keywords');
        document.head.appendChild(kwTag);
      }
      kwTag.setAttribute('content', seoSettings.metaKeywords);
    }
    localStorage.setItem('seoSettings', JSON.stringify(seoSettings));
  }, [seoSettings]);

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
          if (data.settings.products && Array.isArray(data.settings.products) && data.settings.products.length > 0) {
            setProductsList(data.settings.products);
            localStorage.setItem('products', JSON.stringify(data.settings.products));
          }
        }
      })
      .catch(() => {
        // Offline / fallback to localStorage
      });
  }, []);

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
      image: newSlide.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
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
    triggerToast('Meta Title & Description updated successfully!', 'success');
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

  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: Date.now(),
      rating: newProduct.rating || 5.0,
      reviewsCount: newProduct.reviewsCount || 0,
      isFeatured: !!newProduct.isFeatured,
      isBestSeller: !!newProduct.isBestSeller,
      isNewArrival: typeof newProduct.isNewArrival === 'boolean' ? newProduct.isNewArrival : true,
      images: newProduct.images?.length
        ? newProduct.images
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80']
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
    triggerToast(`Product "${productWithId.name}" added successfully!`, 'success');
    return productWithId;
  };

  const updateProduct = (productId, updatedFields) => {
    setProductsList((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p));
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
    triggerToast('Product updated successfully!', 'success');
  };

  const toggleProductBadge = (productId, badgeKey) => {
    setProductsList((prev) => {
      let updatedName = '';
      let newState = false;
      const next = prev.map((p) => {
        if (p.id === productId) {
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

  const deleteProduct = (productId) => {
    setProductsList((prev) => {
      const next = prev.filter((p) => p.id !== productId);
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
    triggerToast('Product deleted.', 'info');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? { ...ord, status: newStatus } : ord))
    );
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

  // Authentication operations with SQLite Backend
  const login = async (email, password) => {
    if (!email || !password) {
      triggerToast('Email and password are required.', 'warning');
      return false;
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Authenticate with SQLite Backend API
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        triggerToast(data.message || 'Logged in successfully!', 'success');
        return true;
      } else {
        triggerToast(data.message || 'Invalid email or password.', 'error');
        return false;
      }
    } catch (_) {
      // 2. Offline Fallback
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
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
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

      const isAdmin = 
        normalizedEmail === 'admin@aerostore.com' ||
        normalizedEmail.startsWith('admin@') ||
        normalizedEmail.includes('admin') ||
        password === 'admin123';

      const mockUser = {
        name: isAdmin ? 'Store Administrator' : 'Jane Doe',
        email: email,
        role: isAdmin ? 'admin' : 'customer',
        phone: isAdmin ? '+1 (555) 999-0000' : '+1 (555) 019-2834',
        avatar: isAdmin
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        joinedDate: isAdmin ? 'January 2026' : 'August 2026',
        addresses: [
          {
            id: 'addr_1',
            street: '128 Pine Street, Suite 400',
            city: 'San Francisco',
            state: 'CA',
            zip: '94103',
            country: 'United States',
            isDefault: true
          }
        ]
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      triggerToast(isAdmin ? 'Welcome back, Administrator!' : 'Logged in successfully!', 'success');
      return true;
    }
  };

  const register = async (fullName, email, phone, password) => {
    if (!fullName || !email || !password) {
      triggerToast('All required fields must be filled.', 'warning');
      return false;
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Register with SQLite Backend API
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: normalizedEmail, phone, password })
      });
      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        triggerToast(data.message || 'Account registered in SQLite successfully!', 'success');
        return true;
      } else {
        triggerToast(data.message || 'Registration failed.', 'error');
        return false;
      }
    } catch (_) {
      // 2. Offline Fallback
      const isSuper = normalizedEmail === 'superadmin@gmail.com';
      const isAdmin = isSuper || normalizedEmail.includes('admin');
      const mockUser = {
        name: fullName,
        email: email,
        role: isSuper ? 'superadmin' : isAdmin ? 'admin' : 'customer',
        phone: phone || '+1 (555) 000-0000',
        avatar: isAdmin
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        joinedDate: 'November 2026',
        addresses: []
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      triggerToast('Account registered successfully!', 'success');
      return true;
    }
  };

  const logout = () => {
    setUser(null);
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

  // Checkout / Create Order
  const createOrder = (shippingDetails, paymentMethod) => {
    const newOrder = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: [...cart],
      totals: {
        subtotal: getCartSubtotal(),
        discount: getCartDiscount(),
        shipping: getShippingCost(),
        tax: getTaxAmount(),
        total: getCartTotal()
      },
      shippingDetails,
      paymentMethod,
      status: 'Processing'
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setCart([]);
    setActiveCoupon(null);
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
        addProduct,
        updateProduct,
        deleteProduct,
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
        features,
        updateFeature,
        resetFeatures,
        uploadFeatureIcon,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        wishlist,
        toggleWishlist,
        user,
        login,
        register,
        logout,
        updateProfile,
        orders,
        createOrder,
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
