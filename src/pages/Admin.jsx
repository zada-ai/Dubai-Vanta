import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import FeatureIcon, { PRESET_ICONS } from '../components/FeatureIcon';
import {
  RiDashboardLine,
  RiShoppingBag3Line,
  RiFileList3Line,
  RiAddLine,
  RiDeleteBinLine,
  RiShieldCheckLine,
  RiSearchLine,
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiArrowRightLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiTruckLine,
  RiCloseCircleLine,
  RiUploadCloud2Line,
  RiRefreshLine,
  RiStore2Line,
  RiImageAddLine,
  RiLayoutTop2Line,
  RiGlobalLine,
  RiSaveLine,
  RiPaletteLine,
  RiGoogleFill,
  RiEdit2Line,
  RiStarFill,
  RiStarLine,
  RiFireFill,
  RiFireLine,
  RiSparklingFill,
  RiSparklingLine,
  RiEyeLine,
  RiCheckLine,
  RiFilter3Line,
  RiPriceTag3Line,
  RiLinksLine,
  RiCodeSSlashLine,
  RiShareLine,
  RiSmartphoneLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiPagesLine,
  RiFileTextLine
} from 'react-icons/ri';

const Admin = () => {
  const { 
    user, 
    login, 
    orders, 
    updateOrderStatus, 
    productsList, 
    addProduct, 
    updateProduct,
    deleteProduct, 
    toggleProductBadge,
    uploadProductImage,
    triggerToast,
    storeLogo,
    uploadLogo,
    resetLogo,
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
    categories,
    addCategory,
    deleteCategory,
    uploadCategoryImage
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'hero' | 'features' | 'seo' | 'products' | 'orders'
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatForm, setNewCatForm] = useState({
    name: '',
    image: '',
    description: ''
  });
  const [isUploadingCatImg, setIsUploadingCatImg] = useState(false);
  const catImgInputRef = useRef(null);

  const handleCatImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Category image must be under 8MB', 'warning');
      return;
    }
    setIsUploadingCatImg(true);
    try {
      const url = await uploadCategoryImage(file);
      if (url) {
        setNewCatForm((prev) => ({ ...prev, image: url }));
      }
    } catch (err) {
      triggerToast('Upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingCatImg(false);
      if (catImgInputRef.current) catImgInputRef.current.value = '';
    }
  };

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) {
      triggerToast('Category name is required', 'warning');
      return;
    }
    const created = await addCategory(newCatForm);
    if (created) {
      if (isAddModalOpen) {
        setNewProd((prev) => ({ ...prev, category: created.id }));
      }
      if (isEditModalOpen && editingProduct) {
        setEditingProduct((prev) => ({ ...prev, category: created.id }));
      }
      setNewCatForm({ name: '', image: '', description: '' });
      setIsCategoryModalOpen(false);
    }
  };

  // Features Bar Editing State
  const [selectedFeatureId, setSelectedFeatureId] = useState(1);
  const [editingFeature, setEditingFeature] = useState(null);
  const [isUploadingFeatureIcon, setIsUploadingFeatureIcon] = useState(false);
  const featureIconFileRef = useRef(null);

  // Hero Section Slide Editing State
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isUploadingSlideImg, setIsUploadingSlideImg] = useState(false);
  const slideImgInputRef = useRef(null);

  // Product Section & Badge Filter & Edit State
  const [productBadgeFilter, setProductBadgeFilter] = useState('all'); // 'all' | 'featured' | 'bestsellers' | 'newarrivals'
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingEditImg, setIsUploadingEditImg] = useState(false);
  const [isUploadingAddImg, setIsUploadingAddImg] = useState(false);
  const editImgInputRef = useRef(null);
  const addImgInputRef = useRef(null);

  // Promo Banner Editing State
  const [editingPromo, setEditingPromo] = useState(null);
  const [isUploadingPromoImg, setIsUploadingPromoImg] = useState(false);
  const promoImgInputRef = useRef(null);

  useEffect(() => {
    if (promoBanner) {
      setEditingPromo({ ...promoBanner });
    }
  }, [promoBanner]);

  // Per-Page SEO & Global SEO State
  const [activeSeoPage, setActiveSeoPage] = useState('home'); // 'home' | 'shop' | 'about' | 'contact' | 'faq' | 'global'
  const [pageSeoForm, setPageSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: ''
  });
  const [globalSeoForm, setGlobalSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    robotsDirective: 'index, follow',
    robotsTxt: '',
    schemaOrgName: '',
    schemaPhone: '',
    schemaEmail: '',
    schemaAddressLocality: 'Dubai',
    schemaAddressCountry: 'AE',
    schemaCurrency: 'AED'
  });
  const [isUploadingOgImg, setIsUploadingOgImg] = useState(false);
  const ogImgInputRef = useRef(null);

  // Sync editing slide when heroSlides or selectedSlideIdx changes
  useEffect(() => {
    if (heroSlides && heroSlides.length > 0) {
      const idx = Math.min(selectedSlideIdx, heroSlides.length - 1);
      setEditingSlide({ ...heroSlides[idx] });
    }
  }, [heroSlides, selectedSlideIdx]);

  // Sync SEO form when activeSeoPage or seoSettings changes
  useEffect(() => {
    if (!seoSettings) return;
    if (activeSeoPage === 'global') {
      setGlobalSeoForm({
        metaTitle: seoSettings.metaTitle || '',
        metaDescription: seoSettings.metaDescription || '',
        metaKeywords: seoSettings.metaKeywords || '',
        robotsDirective: seoSettings.robotsDirective || 'index, follow',
        robotsTxt: seoSettings.robotsTxt || '',
        schemaOrgName: seoSettings.schemaOrgName || '',
        schemaPhone: seoSettings.schemaPhone || '',
        schemaEmail: seoSettings.schemaEmail || '',
        schemaAddressLocality: seoSettings.schemaAddressLocality || 'Dubai',
        schemaAddressCountry: seoSettings.schemaAddressCountry || 'AE',
        schemaCurrency: seoSettings.schemaCurrency || 'AED'
      });
    } else {
      const pageData = seoSettings.pages?.[activeSeoPage] || {};
      setPageSeoForm({
        metaTitle: pageData.metaTitle || '',
        metaDescription: pageData.metaDescription || '',
        metaKeywords: pageData.metaKeywords || '',
        canonicalUrl: pageData.canonicalUrl || '',
        ogTitle: pageData.ogTitle || pageData.metaTitle || '',
        ogDescription: pageData.ogDescription || pageData.metaDescription || '',
        ogImageUrl: pageData.ogImageUrl || seoSettings.ogImageUrl || ''
      });
    }
  }, [activeSeoPage, seoSettings]);

  // Super Admin: Database Users & Role Management
  const [dbUsers, setDbUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setDbUsers(data.users);
      }
    } catch (_) {}
    finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || user?.role === 'superadmin') {
      fetchUsers();
    }
  }, [activeTab, user?.role]);

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`User role updated to ${newRole}!`, 'success');
        fetchUsers();
      } else {
        triggerToast(data.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      triggerToast('Error: ' + err.message, 'error');
    }
  };

  // Sync editing feature when features or selectedFeatureId changes
  useEffect(() => {
    if (features && features.length > 0) {
      const current = features.find((f) => f.id === selectedFeatureId) || features[0];
      setEditingFeature({ ...current });
      if (current) setSelectedFeatureId(current.id);
    }
  }, [features, selectedFeatureId]);

  const handleSaveFeature = (e) => {
    e.preventDefault();
    if (!editingFeature) return;
    updateFeature(editingFeature.id, editingFeature);
  };

  const handleFeatureIconFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('Icon file size must be under 5MB', 'warning');
      return;
    }
    setIsUploadingFeatureIcon(true);
    try {
      const url = await uploadFeatureIcon(file);
      if (url && editingFeature) {
        setEditingFeature((prev) => ({ ...prev, customIconUrl: url, customSvg: '' }));
      }
    } catch (err) {
      triggerToast('Icon upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingFeatureIcon(false);
      if (featureIconFileRef.current) featureIconFileRef.current.value = '';
    }
  };

  const gradientPresets = [
    { label: 'Violet Indigo', value: 'from-violet-600 to-indigo-900', bg: 'from-violet-600 to-indigo-900' },
    { label: 'Amber Warm', value: 'from-amber-600 to-amber-900', bg: 'from-amber-600 to-amber-900' },
    { label: 'Slate Dark', value: 'from-slate-800 to-slate-950', bg: 'from-slate-800 to-slate-950' },
    { label: 'Emerald Teal', value: 'from-emerald-600 to-teal-900', bg: 'from-emerald-600 to-teal-900' },
    { label: 'Rose Pink', value: 'from-rose-600 to-pink-900', bg: 'from-rose-600 to-pink-900' },
    { label: 'Blue Cyan', value: 'from-blue-600 to-cyan-900', bg: 'from-blue-600 to-cyan-900' }
  ];

  const handleSlideImgChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      triggerToast('File size must be under 8MB', 'warning');
      return;
    }
    setIsUploadingSlideImg(true);
    try {
      const url = await uploadHeroImage(file);
      if (url && editingSlide) {
        setEditingSlide((prev) => ({ ...prev, image: url }));
      }
    } catch (err) {
      triggerToast('Slide image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingSlideImg(false);
      if (slideImgInputRef.current) slideImgInputRef.current.value = '';
    }
  };

  const handleSaveSlide = (e) => {
    e.preventDefault();
    if (!editingSlide) return;
    updateHeroSlide(editingSlide.id, editingSlide);
  };

  const handleAddNewSlide = () => {
    const newSlide = addHeroSlide();
    if (newSlide && heroSlides) {
      setSelectedSlideIdx(heroSlides.length);
    }
  };

  const handleDeleteCurrentSlide = () => {
    if (!editingSlide) return;
    if (heroSlides.length <= 1) {
      triggerToast('At least one hero slide must remain.', 'warning');
      return;
    }
    deleteHeroSlide(editingSlide.id);
    setSelectedSlideIdx(0);
  };

  // Promo Banner Handlers
  const handlePromoImgChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Banner image must be under 8MB', 'warning');
      return;
    }
    setIsUploadingPromoImg(true);
    try {
      const url = await uploadPromoImage(file);
      if (url && editingPromo) {
        setEditingPromo((prev) => ({ ...prev, image: url }));
      }
    } catch (err) {
      triggerToast('Promo image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingPromoImg(false);
      if (promoImgInputRef.current) promoImgInputRef.current.value = '';
    }
  };

  const handleSavePromoBanner = (e) => {
    e.preventDefault();
    if (!editingPromo) return;
    updatePromoBanner(editingPromo);
  };

  // SEO Handlers
  const handleSavePageSeo = (e) => {
    e.preventDefault();
    updatePageSeo(activeSeoPage, pageSeoForm);
  };

  const handleSaveGlobalSeo = (e) => {
    e.preventDefault();
    updateSeoSettings(globalSeoForm);
  };

  const handleOgImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Image file size must be under 8MB', 'warning');
      return;
    }
    setIsUploadingOgImg(true);
    try {
      const url = await uploadOgImage(file);
      if (url) {
        setPageSeoForm((prev) => ({ ...prev, ogImageUrl: url }));
      }
    } catch (err) {
      triggerToast('OG image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingOgImg(false);
      if (ogImgInputRef.current) ogImgInputRef.current.value = '';
    }
  };

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    brand: '',
    category: 'electronics',
    price: '',
    discountPrice: '',
    stock: 20,
    image: '',
    description: '',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  });

  const handleAddImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Product image must be under 8MB', 'warning');
      return;
    }
    setIsUploadingAddImg(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setNewProd((prev) => ({ ...prev, image: url }));
      }
    } catch (err) {
      triggerToast('Upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingAddImg(false);
      if (addImgInputRef.current) addImgInputRef.current.value = '';
    }
  };

  const handleEditImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Product image must be under 8MB', 'warning');
      return;
    }
    setIsUploadingEditImg(true);
    try {
      const url = await uploadProductImage(file);
      if (url && editingProduct) {
        setEditingProduct((prev) => ({ ...prev, image: url }));
      }
    } catch (err) {
      triggerToast('Upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingEditImg(false);
      if (editImgInputRef.current) editImgInputRef.current.value = '';
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct({
      ...prod,
      image: prod.images?.[0] || '',
      isFeatured: !!prod.isFeatured,
      isBestSeller: !!prod.isBestSeller,
      isNewArrival: !!prod.isNewArrival
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const priceNum = parseFloat(editingProduct.price);
    const discountNum = editingProduct.discountPrice ? parseFloat(editingProduct.discountPrice) : priceNum;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      brand: editingProduct.brand || 'AeroStore',
      category: editingProduct.category,
      price: priceNum,
      discountPrice: discountNum,
      stock: parseInt(editingProduct.stock) || 0,
      description: editingProduct.description || '',
      images: editingProduct.image ? [editingProduct.image] : editingProduct.images || [],
      isFeatured: !!editingProduct.isFeatured,
      isBestSeller: !!editingProduct.isBestSeller,
      isNewArrival: !!editingProduct.isNewArrival
    });
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Access check
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-5">
            <RiShieldCheckLine className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Yeh page sirf Administrator aur Super Admin ke liye hai.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => login('superadmin@gmail.com', 'password123')}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition cursor-pointer text-sm shadow-sm"
            >
              ⚡ 1-Click Super Admin Login (superadmin@gmail.com)
            </button>
            <button
              onClick={() => login('admin@aerostore.com', 'admin123')}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition cursor-pointer text-sm shadow-sm"
            >
              1-Click Admin Login (Demo)
            </button>
            <Link
              to="/login?redirect=/admin"
              className="block w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm"
            >
              Regular Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculations for stats
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totals?.total || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = productsList?.length || 0;
  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;

  // Counts for home display sections
  const featuredCount = (productsList || []).filter((p) => p.isFeatured).length;
  const bestSellerCount = (productsList || []).filter((p) => p.isBestSeller).length;
  const newArrivalCount = (productsList || []).filter((p) => p.isNewArrival).length;

  // Filtered products with badge filtering
  const filteredProducts = (productsList || []).filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (productBadgeFilter === 'featured') return !!p.isFeatured;
    if (productBadgeFilter === 'bestsellers') return !!p.isBestSeller;
    if (productBadgeFilter === 'newarrivals') return !!p.isNewArrival;
    return true;
  });

  // Filtered orders
  const filteredOrders =
    orderFilter === 'All' ? orders : orders.filter((o) => o.status === orderFilter);

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      triggerToast('Please provide at least product name and price.', 'warning');
      return;
    }

    const priceNum = parseFloat(newProd.price);
    const discountNum = newProd.discountPrice ? parseFloat(newProd.discountPrice) : priceNum;

    addProduct({
      name: newProd.name,
      brand: newProd.brand || 'AeroStore',
      category: newProd.category,
      price: priceNum,
      discountPrice: discountNum,
      stock: parseInt(newProd.stock) || 10,
      description: newProd.description || 'Premium quality product curated for AeroStore customers.',
      image: newProd.image || '',
      images: (newProd.image && newProd.image.trim()) ? [newProd.image.trim()] : [],
      colors: ['#000000', '#FFFFFF'],
      sizes: ['Standard'],
      isFeatured: !!newProd.isFeatured,
      isBestSeller: !!newProd.isBestSeller,
      isNewArrival: !!newProd.isNewArrival
    });

    setNewProd({
      name: '',
      brand: '',
      category: 'electronics',
      price: '',
      discountPrice: '',
      stock: 20,
      image: '',
      description: '',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true
    });
    setIsAddModalOpen(false);
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('File size must be under 5MB', 'warning');
      return;
    }

    setIsUploadingLogo(true);
    try {
      await uploadLogo(file);
    } catch (err) {
      triggerToast('Upload failed: ' + err.message, 'error');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <RiCheckboxCircleLine className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <RiTruckLine className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <RiCloseCircleLine className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <RiTimeLine className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="py-6 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
              user.role === 'superadmin'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
            }`}>
              {user.role === 'superadmin' ? '⚡ Super Admin Portal' : 'Admin Portal'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {user.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Store Administration
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-sm transition cursor-pointer"
          >
            <RiAddLine className="w-4 h-4" /> Add Product
          </button>
          <Link
            to="/shop"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-2xl transition"
          >
            View Live Store
          </Link>
        </div>
      </div>

      {/* Store Logo Management - SVG & Pure Logo Only */}
      <section className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Info & Live Preview */}
          <div className="space-y-4 max-w-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <RiStore2Line className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Header SVG / Logo Branding
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apna SVG ya Image logo upload karein. Jab aap custom logo upload karenge to header mein se extra text (AEROSTORE) khud remove ho jayega aur sirf aapka original logo <strong className="text-slate-700 dark:text-slate-300">exact same height (32px / h-8)</strong> par display hoga.
              </p>
            </div>

            {/* Exact Header Preview Box */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Live Header Preview:
              </span>
              <div className="flex items-center px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[48px]">
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt="Store Logo"
                    className="h-8 max-h-8 w-auto max-w-[180px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center font-black text-white dark:text-slate-950 text-base shadow-sm">
                      A
                    </span>
                    <span className="text-lg font-black tracking-wider text-slate-900 dark:text-white uppercase">
                      AEROSTORE
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold">
                ✓ Height: 32px (h-8) - Pure Logo Only
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Hidden File Input supporting SVG */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoFileChange}
              accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploadingLogo}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-black transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RiUploadCloud2Line className="w-4 h-4" />
              {isUploadingLogo ? 'Uploading SVG...' : 'Upload SVG / Logo'}
            </button>

            {storeLogo && (
              <button
                type="button"
                onClick={resetLogo}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                title="Reset to default AeroStore logo"
              >
                <RiRefreshLine className="w-4 h-4" /> Reset to Default
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <RiMoneyDollarCircleLine className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            AED {totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-1">From live & recent orders</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-600">
              <RiFileList3Line className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalOrdersCount}</div>
          <p className="text-xs text-slate-400 mt-1">{pendingOrders} pending fulfillment</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <RiShoppingBag3Line className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalProductsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Across all categories</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Admin Status</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <RiShieldCheckLine className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {user.role === 'superadmin' ? 'Super Admin' : 'Active'}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            {user.role === 'superadmin' ? 'Root Super Admin Privileges' : 'Full Permissions'}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiDashboardLine className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiLayoutTop2Line className="w-4 h-4" /> Hero Section ({heroSlides?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'features'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiShieldCheckLine className="w-4 h-4" /> Features Bar ({features?.length || 4})
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'promo'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiPriceTag3Line className="w-4 h-4 text-violet-500" /> Promo Banner
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiGlobalLine className="w-4 h-4" /> SEO & Meta Tags
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiShoppingBag3Line className="w-4 h-4" /> Products ({totalProductsCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RiFileList3Line className="w-4 h-4" /> Orders ({totalOrdersCount})
        </button>
        {user?.role === 'superadmin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            <RiShieldCheckLine className="w-4 h-4" /> Users & Roles ({dbUsers.length})
          </button>
        )}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all orders <RiArrowRightLine className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No orders placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.orderId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {ord.orderId}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {ord.shippingDetails
                            ? `${ord.shippingDetails.firstName} ${ord.shippingDetails.lastName}`
                            : 'Customer'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{ord.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          AED {ord.totals?.total?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-bold text-primary-600 hover:underline cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Home Showcase Sections Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Home Page Showcase Sections Status
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ye products live homepage par featured aur highlight ho rahe hain
                </p>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Manage Badges <RiArrowRightLine className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Featured Card */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <RiStarFill className="w-4 h-4 text-amber-500" /> Featured Products
                  </span>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {featuredCount} items
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Home page ke 'Featured Products' grid mein first 4 items show hote hain.
                </p>
                <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                  {(productsList || []).filter((p) => p.isFeatured).slice(0, 4).map((p) => (
                    <img
                      key={p.id}
                      src={p.images?.[0]}
                      alt={p.name}
                      title={p.name}
                      className="w-8 h-8 rounded-lg object-cover border border-amber-300 dark:border-amber-700 shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* Best Sellers Card */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <RiFireFill className="w-4 h-4 text-rose-500" /> Best Sellers
                  </span>
                  <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full">
                    {bestSellerCount} items
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Home page ke 'Best Selling Products' grid mein first 4 items show hote hain.
                </p>
                <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                  {(productsList || []).filter((p) => p.isBestSeller).slice(0, 4).map((p) => (
                    <img
                      key={p.id}
                      src={p.images?.[0]}
                      alt={p.name}
                      title={p.name}
                      className="w-8 h-8 rounded-lg object-cover border border-rose-300 dark:border-rose-700 shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* New Arrivals Card */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <RiSparklingFill className="w-4 h-4 text-indigo-500" /> New Arrivals
                  </span>
                  <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    {newArrivalCount} items
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Home page ke 'New Arrivals' grid mein first 4 items show hote hain.
                </p>
                <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                  {(productsList || []).filter((p) => p.isNewArrival).slice(0, 4).map((p) => (
                    <img
                      key={p.id}
                      src={p.images?.[0]}
                      alt={p.name}
                      title={p.name}
                      className="w-8 h-8 rounded-lg object-cover border border-indigo-300 dark:border-indigo-700 shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Top Info & Slide Selector Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <RiLayoutTop2Line className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Hero Section Carousel Slides
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Homepage ke main slider ka har ek element yahan se customize karein (Title, Subtitle, Description, Button CTA & Link, Image Upload, Gradient).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddNewSlide}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-2xl shadow-xs transition cursor-pointer"
                >
                  <RiAddLine className="w-4 h-4" /> Add Slide
                </button>
                <button
                  type="button"
                  onClick={resetHeroSlides}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition cursor-pointer"
                  title="Reset to default slides"
                >
                  <RiRefreshLine className="w-4 h-4" /> Reset Defaults
                </button>
              </div>
            </div>

            {/* Slide Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              {heroSlides?.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setSelectedSlideIdx(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedSlideIdx === idx
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedSlideIdx === idx ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-slate-400'}`} />
                  Slide {idx + 1}: {slide.title ? (slide.title.length > 18 ? slide.title.slice(0, 18) + '...' : slide.title) : 'Untitled'}
                </button>
              ))}
            </div>
          </div>

          {editingSlide && (
            <div className="space-y-6">
              {/* Live Mini Preview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Live Home Page Slide Preview (Slide {selectedSlideIdx + 1})
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-bold">
                    Interactive Preview
                  </span>
                </div>

                <div
                  className={`w-full min-h-[260px] sm:min-h-[300px] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br ${
                    editingSlide.bgColor || 'from-violet-600 to-indigo-900'
                  } text-white shadow-md transition-all duration-300`}
                >
                  {/* Left Content */}
                  <div className="w-full md:w-3/5 text-left space-y-2 z-10">
                    {editingSlide.subtitle && (
                      <p className="text-[10px] sm:text-xs font-bold tracking-widest text-primary-200 uppercase">
                        {editingSlide.subtitle}
                      </p>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-black leading-tight drop-shadow-xs">
                      {editingSlide.title || 'Slide Title'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 max-w-md line-clamp-3 leading-relaxed">
                      {editingSlide.description || 'Slide description here...'}
                    </p>
                    <div className="pt-2">
                      <span className="inline-block px-5 py-2 text-xs font-bold rounded-full bg-white text-slate-900 shadow-md">
                        {editingSlide.btnText || 'Shop Collection'} →
                      </span>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="w-full md:w-2/5 flex items-center justify-center relative z-10">
                    {editingSlide.image ? (
                      <img
                        src={editingSlide.image}
                        alt={editingSlide.title}
                        className="max-h-44 sm:max-h-56 max-w-full object-contain rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-36 h-36 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-xs text-white/60">
                        <RiImageAddLine className="w-8 h-8 mb-1" /> No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Editing Form */}
              <form onSubmit={handleSaveSlide} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Edit Slide #{selectedSlideIdx + 1} Content & Styling
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteCurrentSlide}
                      disabled={heroSlides?.length <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                      title="Delete this slide"
                    >
                      <RiDeleteBinLine className="w-3.5 h-3.5" /> Delete Slide
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <RiSaveLine className="w-4 h-4" /> Save Slide
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                  {/* Left Column: Text & Links */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Subtitle / Eyebrow Tag
                      </label>
                      <input
                        type="text"
                        value={editingSlide.subtitle || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                        placeholder="e.g. THE FUTURE OF ACOUSTICS"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Main Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingSlide.title || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                        placeholder="e.g. AeroSound Max"
                        className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Description *
                      </label>
                      <textarea
                        rows="3"
                        required
                        value={editingSlide.description || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                        placeholder="e.g. Experience pure acoustic bliss with active noise cancellation..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Button CTA Text
                        </label>
                        <input
                          type="text"
                          value={editingSlide.btnText || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, btnText: e.target.value })}
                          placeholder="e.g. Shop Collection"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Button Target Link
                        </label>
                        <input
                          type="text"
                          value={editingSlide.link || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, link: e.target.value })}
                          placeholder="e.g. /shop or /product/1"
                          className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visuals & Media */}
                  <div className="space-y-4">
                    {/* Slide Image */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Slide Image (URL ya Computer se Upload)
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={editingSlide.image || ''}
                            onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="file"
                            ref={slideImgInputRef}
                            onChange={handleSlideImgChange}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingSlideImg}
                            onClick={() => slideImgInputRef.current && slideImgInputRef.current.click()}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            <RiUploadCloud2Line className="w-4 h-4" />
                            {isUploadingSlideImg ? 'Uploading...' : 'Upload File'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Supports PNG, JPG, WEBP, SVG (Transparent PNGs or product shots work best).
                        </p>
                      </div>
                    </div>

                    {/* Background Gradient */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Background Gradient Preset
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {gradientPresets.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setEditingSlide({ ...editingSlide, bgColor: preset.value })}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition cursor-pointer text-left ${
                              editingSlide.bgColor === preset.value
                                ? 'border-primary-500 ring-2 ring-primary-500/20 bg-slate-50 dark:bg-slate-800'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-lg shrink-0 bg-gradient-to-r ${preset.bg}`} />
                            <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Custom Gradient Tailwind Classes
                      </label>
                      <input
                        type="text"
                        value={editingSlide.bgColor || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, bgColor: e.target.value })}
                        placeholder="e.g. from-violet-600 to-indigo-900"
                        className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tailwind gradient classes: e.g. <code className="text-primary-500">from-amber-600 to-amber-900</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-sm transition cursor-pointer"
                  >
                    <RiSaveLine className="w-4 h-4" /> Save Slide Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FEATURES BAR */}
      {activeTab === 'features' && (
        <div className="space-y-6 text-left">
          {/* Top Info & Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <RiShieldCheckLine className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Brand Value & Features Bar
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Home page ke hero section ke niche wale 4 feature boxes ko customize karein (SVG icon, Title, aur Description paragraph &lt;p&gt;).
              </p>
            </div>

            <button
              type="button"
              onClick={resetFeatures}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition cursor-pointer self-start sm:self-auto"
            >
              <RiRefreshLine className="w-4 h-4" /> Reset to Defaults
            </button>
          </div>

          {/* Live Preview of the exact Homepage Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Live Store Appearance (Home Page View)
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
                ✓ 4-Badge Value Banner
              </span>
            </div>

            {/* Exact rendered grid from Home.jsx */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-xs">
              {features?.map((feat) => {
                const isSelected = selectedFeatureId === feat.id;
                return (
                  <div
                    key={feat.id}
                    onClick={() => setSelectedFeatureId(feat.id)}
                    className={`flex items-center gap-2.5 sm:gap-4 p-2.5 rounded-2xl transition cursor-pointer ${
                      isSelected
                        ? 'bg-primary-500/10 ring-2 ring-primary-500/40'
                        : 'hover:bg-white dark:hover:bg-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="shrink-0 p-2 sm:p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <FeatureIcon feature={feat} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs leading-snug text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 text-center sm:text-left">
              Click any badge above to edit its Title, Description, and Icon below.
            </p>
          </div>

          {/* Feature Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {features?.map((feat, idx) => (
              <button
                key={feat.id}
                onClick={() => setSelectedFeatureId(feat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  selectedFeatureId === feat.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FeatureIcon feature={feat} className="w-3.5 h-3.5" />
                <span>Badge {idx + 1}: {feat.title}</span>
              </button>
            ))}
          </div>

          {/* Edit Form */}
          {editingFeature && (
            <form onSubmit={handleSaveFeature} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                    <FeatureIcon feature={editingFeature} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Edit Badge #{editingFeature.id}: {editingFeature.title}
                    </h4>
                    <p className="text-xs text-slate-400">Update title, subtitle paragraph (&lt;p&gt;), and icon / SVG.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <RiSaveLine className="w-4 h-4" /> Save Feature #{editingFeature.id}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Title & Paragraph (p) */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Feature Title (&lt;h4&gt;) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingFeature.title || ''}
                      onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                      placeholder="e.g. Free Shipping"
                      className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Feature Subtitle / Description (&lt;p&gt;) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingFeature.description || ''}
                      onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                      placeholder="e.g. On all orders over AED 150"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* File Upload for custom SVG or Icon Image */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Upload Custom SVG / Icon File
                    </label>
                    <input
                      type="file"
                      ref={featureIconFileRef}
                      onChange={handleFeatureIconFileChange}
                      accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg"
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isUploadingFeatureIcon}
                        onClick={() => featureIconFileRef.current && featureIconFileRef.current.click()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        <RiUploadCloud2Line className="w-4 h-4" />
                        {isUploadingFeatureIcon ? 'Uploading...' : 'Choose SVG / Image File'}
                      </button>

                      {editingFeature.customIconUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingFeature({ ...editingFeature, customIconUrl: '' })}
                          className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
                        >
                          Remove uploaded file
                        </button>
                      )}
                    </div>
                    {editingFeature.customIconUrl && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                        Active file: {editingFeature.customIconUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* Column 2: Icon Options */}
                <div className="space-y-4">
                  {/* Preset Icons Selection */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Or Choose Preset Icon:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {PRESET_ICONS.map((preset) => {
                        const Icon = preset.Icon;
                        const isPresetSelected =
                          editingFeature.iconPreset === preset.id &&
                          !editingFeature.customIconUrl &&
                          !editingFeature.customSvg;

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setEditingFeature({
                                ...editingFeature,
                                iconPreset: preset.id,
                                customIconUrl: '',
                                customSvg: ''
                              })
                            }
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
                              isPresetSelected
                                ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="truncate max-w-[70px]">{preset.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Raw SVG Markup Code */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Raw SVG Code (Optional Direct Vector Markup)
                    </label>
                    <textarea
                      rows="3"
                      value={editingFeature.customSvg || ''}
                      onChange={(e) =>
                        setEditingFeature({
                          ...editingFeature,
                          customSvg: e.target.value,
                          customIconUrl: ''
                        })
                      }
                      placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Aap kisi bhi SVG ka raw XML code yahan direct paste kar sakte hain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-sm transition cursor-pointer"
                >
                  <RiSaveLine className="w-4 h-4" /> Save Feature #{editingFeature.id}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROMOTIONAL OFFER BANNER */}
      {activeTab === 'promo' && editingPromo && (
        <div className="space-y-6 text-left">
          {/* Top Info & Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <RiPriceTag3Line className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Homepage Promotional Offer Banner
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Home page par display hone wale 20% discount promotional banner ko yahan se customize karein (Badge, Heading, Coupon Code, Button, Image upload aur Background gradient).
              </p>
            </div>

            <button
              type="button"
              onClick={resetPromoBanner}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition cursor-pointer self-start sm:self-auto"
            >
              <RiRefreshLine className="w-4 h-4" /> Reset to Defaults
            </button>
          </div>

          {/* Live Preview of Promotional Banner matching Homepage exactly */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Live Store Appearance (Home Page Promotional Section)
              </span>
              <div className="flex items-center gap-2">
                {editingPromo.isVisible === false ? (
                  <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full font-bold">
                    ⚠️ Hidden on Homepage
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
                    ✓ Active on Homepage
                  </span>
                )}
              </div>
            </div>

            {/* Rendered Live Banner */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${editingPromo.bgGradient || 'from-violet-600 to-indigo-850'} p-6 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8`}>
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="w-full md:w-3/5 text-left relative z-10 flex flex-col items-start">
                {editingPromo.badge && (
                  <span className="text-[10px] font-extrabold tracking-widest text-white bg-white/15 px-3 py-1 rounded-full uppercase mb-3">
                    {editingPromo.badge}
                  </span>
                )}
                <h2 className="text-xl md:text-3xl font-black leading-tight mb-3">
                  {editingPromo.title || 'Enjoy 20% Off Your First Purchase'}
                </h2>
                <div className="text-xs text-slate-200 mb-5 leading-relaxed max-w-md">
                  <span>{editingPromo.description}</span>
                  {editingPromo.couponCode && (
                    <span className="block mt-2">
                      Use code <strong className="text-white bg-slate-950/45 px-2 py-0.5 rounded font-mono font-bold tracking-wider">{editingPromo.couponCode}</strong> during checkout.
                    </span>
                  )}
                </div>
                <div className="px-5 py-2.5 bg-white text-slate-900 text-xs font-bold rounded-full shadow-md flex items-center gap-2">
                  {editingPromo.btnText || 'Claim Discount'}
                  <RiArrowRightLine className="w-3.5 h-3.5 animate-pulse" />
                </div>
              </div>

              {editingPromo.image && (
                <div className="w-full md:w-2/5 flex justify-center relative">
                  <div className="absolute inset-0 bg-white/5 rounded-full filter blur-2xl" />
                  <img
                    src={editingPromo.image}
                    alt={editingPromo.imageAlt || editingPromo.title}
                    className="max-h-[140px] md:max-h-[170px] max-w-full object-contain rounded-2xl drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-10"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSavePromoBanner} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Customize Promo Banner Content & Design
              </h4>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <RiSaveLine className="w-4 h-4" /> Save Banner Changes
              </button>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Show Promotional Banner on Homepage
                </div>
                <p className="text-xs text-slate-400">
                  Enable ya disable karein agar aap temporary tor par banner ko chupana chahte hain.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPromo.isVisible !== false}
                  onChange={(e) => setEditingPromo({ ...editingPromo, isVisible: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Badge Text */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Top Pill Badge Text *
                </label>
                <input
                  type="text"
                  required
                  value={editingPromo.badge || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, badge: e.target.value })}
                  placeholder="e.g. LIMITED TIME OFFER"
                  className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Coupon Code */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Coupon / Promo Code (e.g. WELCOME20)
                </label>
                <input
                  type="text"
                  value={editingPromo.couponCode || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, couponCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME20"
                  className="w-full px-4 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Main Headline */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Main Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPromo.title || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  placeholder="e.g. Enjoy 20% Off Your First Purchase"
                  className="w-full px-4 py-2.5 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description Text *
                </label>
                <textarea
                  rows="3"
                  required
                  value={editingPromo.description || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  placeholder="e.g. Register your account today and use code WELCOME20 during checkout to unlock discount rates."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Call-to-Action Button Label
                </label>
                <input
                  type="text"
                  value={editingPromo.btnText || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, btnText: e.target.value })}
                  placeholder="e.g. Claim Discount"
                  className="w-full px-4 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Button Target Link */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Button Target URL / Route
                </label>
                <input
                  type="text"
                  value={editingPromo.btnLink || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, btnLink: e.target.value })}
                  placeholder="e.g. /shop or /product/1"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Background Gradient Selection */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Background Color Gradient
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { label: 'Violet Indigo', val: 'from-violet-600 to-indigo-850', preview: 'from-violet-600 to-indigo-850' },
                    { label: 'Sunset Crimson', val: 'from-rose-600 to-amber-700', preview: 'from-rose-600 to-amber-700' },
                    { label: 'Emerald Luxury', val: 'from-emerald-600 to-teal-900', preview: 'from-emerald-600 to-teal-900' },
                    { label: 'Deep Cyan', val: 'from-blue-600 to-cyan-900', preview: 'from-blue-600 to-cyan-900' },
                    { label: 'Royal Purple', val: 'from-fuchsia-700 to-indigo-950', preview: 'from-fuchsia-700 to-indigo-950' },
                    { label: 'Obsidian Dark', val: 'from-slate-900 to-zinc-950', preview: 'from-slate-900 to-zinc-950' }
                  ].map((grad) => (
                    <button
                      key={grad.val}
                      type="button"
                      onClick={() => setEditingPromo({ ...editingPromo, bgGradient: grad.val })}
                      className={`h-11 rounded-xl bg-gradient-to-r ${grad.preview} text-white text-[11px] font-bold shadow-xs transition flex items-center justify-center cursor-pointer ${
                        editingPromo.bgGradient === grad.val ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {grad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Graphic Image */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Promotional Graphic Image (URL ya Computer se Upload)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={editingPromo.image || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="file"
                    ref={promoImgInputRef}
                    onChange={handlePromoImgChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingPromoImg}
                    onClick={() => promoImgInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                  >
                    <RiUploadCloud2Line className="w-4 h-4" />
                    {isUploadingPromoImg ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>

              {/* Image Alt Text for SEO */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Image Alt Text (SEO Accessibility Requirement) *
                </label>
                <input
                  type="text"
                  value={editingPromo.imageAlt || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, imageAlt: e.target.value })}
                  placeholder="e.g. Nike red shoe discount promotional graphic"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-sm transition cursor-pointer"
              >
                <RiSaveLine className="w-4 h-4" /> Save Promo Banner
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: SEO & META TAGS SUITE */}
      {activeTab === 'seo' && (
        <div className="space-y-6 text-left">
          {/* Top Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <RiGlobalLine className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Per-Page Search Engine Optimization (SEO) & Social Meta Suite
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AeroStore ke har individual page (Home, Shop, About, Contact, FAQ) ka <strong>Meta Title</strong>, <strong>Meta Description</strong>, <strong>Keywords</strong>, <strong>Canonical URL</strong>, aur <strong>OpenGraph / Social Image</strong> yahan se manage karein. Changes live DOM aur browser tabs par dynamic apply hotay hain.
              </p>
            </div>
          </div>

          {/* Page Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            {[
              { key: 'home', label: 'Home Page (/)', path: '/' },
              { key: 'shop', label: 'Shop Catalog (/shop)', path: '/shop' },
              { key: 'about', label: 'About Us (/about)', path: '/about' },
              { key: 'contact', label: 'Contact Us (/contact)', path: '/contact' },
              { key: 'faq', label: 'FAQ (/faq)', path: '/faq' },
              { key: 'global', label: '⚙️ Global, Robots & Sitemap', path: 'Technical SEO' }
            ].map((page) => (
              <button
                key={page.key}
                type="button"
                onClick={() => setActiveSeoPage(page.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSeoPage === page.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{page.label}</span>
              </button>
            ))}
          </div>

          {/* PAGE-SPECIFIC SEO FORM & PREVIEWS */}
          {activeSeoPage !== 'global' && (
            <div className="space-y-6">
              {/* Dual Previews: Google SERP + WhatsApp / Social Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. Google SERP Snippet Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiGoogleFill className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Google Search SERP Preview
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {activeSeoPage.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] flex items-center justify-center font-bold">
                        A
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {pageSeoForm.canonicalUrl || `https://aerostore.com${activeSeoPage === 'home' ? '/' : '/' + activeSeoPage}`}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
                      {pageSeoForm.metaTitle || `${activeSeoPage.toUpperCase()} - AeroStore Dubai`}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                      {pageSeoForm.metaDescription || 'Experience pure acoustic bliss, designer furniture, and timeless apparel.'}
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Browser Tab Preview:
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-t-lg border-t border-x border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium max-w-sm truncate shadow-2xs">
                      <span className="w-3 h-3 rounded-full bg-primary-600 flex items-center justify-center text-[7px] text-white font-bold">⚡</span>
                      <span className="truncate">{pageSeoForm.metaTitle || 'AeroStore'}</span>
                      <RiCloseLine className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                    </div>
                  </div>
                </div>

                {/* 2. OpenGraph WhatsApp / Social Share Card Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiShareLine className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Social Share & WhatsApp Card Preview
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      OpenGraph
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="h-32 sm:h-36 bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                      {pageSeoForm.ogImageUrl ? (
                        <img
                          src={pageSeoForm.ogImageUrl}
                          alt="OpenGraph Social Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          No Social Image Selected
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        AEROSTORE.COM
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {pageSeoForm.ogTitle || pageSeoForm.metaTitle || 'AeroStore Dubai'}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {pageSeoForm.ogDescription || pageSeoForm.metaDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page SEO Editing Form */}
              <form onSubmit={handleSavePageSeo} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <RiPagesLine className="w-5 h-5 text-primary-600" />
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Edit SEO Tags for {activeSeoPage.toUpperCase()} Page
                    </h4>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <RiSaveLine className="w-4 h-4" /> Save {activeSeoPage.toUpperCase()} SEO
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Meta Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Meta Title (&lt;title&gt;) *
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${
                        pageSeoForm.metaTitle?.length > 60 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {pageSeoForm.metaTitle?.length || 0} / 60 chars (Recommended)
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={pageSeoForm.metaTitle || ''}
                      onChange={(e) => setPageSeoForm({ ...pageSeoForm, metaTitle: e.target.value })}
                      placeholder="e.g. Shop Luxury Collections | AeroStore Dubai"
                      className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Meta Description (&lt;meta name="description"&gt;) *
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${
                        pageSeoForm.metaDescription?.length > 160 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {pageSeoForm.metaDescription?.length || 0} / 160 chars (Recommended)
                      </span>
                    </div>
                    <textarea
                      rows="3"
                      required
                      value={pageSeoForm.metaDescription || ''}
                      onChange={(e) => setPageSeoForm({ ...pageSeoForm, metaDescription: e.target.value })}
                      placeholder="e.g. Explore our complete catalogue of premium headphones, smart watches, luxury fashion, and designer living essentials."
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Meta Keywords & Canonical URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Meta Keywords (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={pageSeoForm.metaKeywords || ''}
                        onChange={(e) => setPageSeoForm({ ...pageSeoForm, metaKeywords: e.target.value })}
                        placeholder="e.g. online shopping dubai, buy electronics uae"
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Canonical URL (&lt;link rel="canonical"&gt;)
                      </label>
                      <input
                        type="url"
                        value={pageSeoForm.canonicalUrl || ''}
                        onChange={(e) => setPageSeoForm({ ...pageSeoForm, canonicalUrl: e.target.value })}
                        placeholder="https://aerostore.com/shop"
                        className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* OpenGraph Social Meta Tags */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                      OpenGraph Social Sharing Customization (og:title, og:desc, og:image)
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Social Title (og:title)
                        </label>
                        <input
                          type="text"
                          value={pageSeoForm.ogTitle || ''}
                          onChange={(e) => setPageSeoForm({ ...pageSeoForm, ogTitle: e.target.value })}
                          placeholder="Defaults to Meta Title if blank"
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Social Description (og:description)
                        </label>
                        <input
                          type="text"
                          value={pageSeoForm.ogDescription || ''}
                          onChange={(e) => setPageSeoForm({ ...pageSeoForm, ogDescription: e.target.value })}
                          placeholder="Defaults to Meta Description if blank"
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Social Share Thumbnail Image (og:image)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          value={pageSeoForm.ogImageUrl || ''}
                          onChange={(e) => setPageSeoForm({ ...pageSeoForm, ogImageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="file"
                          ref={ogImgInputRef}
                          onChange={handleOgImgUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingOgImg}
                          onClick={() => ogImgInputRef.current?.click()}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                        >
                          <RiUploadCloud2Line className="w-4 h-4" />
                          {isUploadingOgImg ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-sm transition cursor-pointer"
                  >
                    <RiSaveLine className="w-4 h-4" /> Save {activeSeoPage.toUpperCase()} SEO
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GLOBAL TECHNICAL SEO, ROBOTS.TXT & SITEMAP.XML */}
          {activeSeoPage === 'global' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveGlobalSeo} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <RiGlobalLine className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Global Search Engine & Technical SEO Configuration
                    </h4>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <RiSaveLine className="w-4 h-4" /> Save Technical SEO
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Organization / Brand Name (Schema.org)
                    </label>
                    <input
                      type="text"
                      value={globalSeoForm.schemaOrgName || ''}
                      onChange={(e) => setGlobalSeoForm({ ...globalSeoForm, schemaOrgName: e.target.value })}
                      placeholder="e.g. AeroStore UAE"
                      className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Search Engine Robots Directive (&lt;meta name="robots"&gt;)
                    </label>
                    <select
                      value={globalSeoForm.robotsDirective || 'index, follow'}
                      onChange={(e) => setGlobalSeoForm({ ...globalSeoForm, robotsDirective: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <option value="index, follow">index, follow (Default - Allow full Google indexing)</option>
                      <option value="noindex, follow">noindex, follow (Hide from search, follow links)</option>
                      <option value="noindex, nofollow">noindex, nofollow (Complete privacy blocking)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Concierge Support Phone (Schema)
                    </label>
                    <input
                      type="text"
                      value={globalSeoForm.schemaPhone || ''}
                      onChange={(e) => setGlobalSeoForm({ ...globalSeoForm, schemaPhone: e.target.value })}
                      placeholder="+971 4 123 4567"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Support Email (Schema)
                    </label>
                    <input
                      type="email"
                      value={globalSeoForm.schemaEmail || ''}
                      onChange={(e) => setGlobalSeoForm({ ...globalSeoForm, schemaEmail: e.target.value })}
                      placeholder="support@aerostore.com"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Robots.txt Live Editor */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <RiFileTextLine className="w-4 h-4 text-primary-600" />
                        Live robots.txt Configuration
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Bots aur crawlers ke liye rules define karein.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(globalSeoForm.robotsTxt || seoSettings.robotsTxt);
                        triggerToast('robots.txt copied to clipboard!', 'info');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <RiFileCopyLine className="w-3.5 h-3.5" /> Copy robots.txt
                    </button>
                  </div>

                  <textarea
                    rows="6"
                    value={globalSeoForm.robotsTxt || ''}
                    onChange={(e) => setGlobalSeoForm({ ...globalSeoForm, robotsTxt: e.target.value })}
                    className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Sitemap.xml Live Inspector */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <RiCodeSSlashLine className="w-4 h-4 text-emerald-600" />
                        Dynamic XML Sitemap (sitemap.xml)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        All application routes, products, categories, change frequencies, and priorities automatically indexed.
                      </p>
                    </div>
                    <a
                      href="http://localhost:5000/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition"
                    >
                      <RiExternalLinkLine className="w-3.5 h-3.5" /> Open /sitemap.xml
                    </a>
                  </div>

                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-56">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aerostore.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aerostore.com/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://aerostore.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://aerostore.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://aerostore.com/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <!-- Plus all dynamic store products & categories -->
</urlset>`}
                  </pre>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-sm transition cursor-pointer"
                  >
                    <RiSaveLine className="w-4 h-4" /> Save Technical SEO
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6 text-left">
          {/* Top Banner: Homepage Section Access Control */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <RiStarFill className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Home Page Showcase & Product Badges Control
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Home page ke 3 main sections (<strong className="text-amber-600 dark:text-amber-400">⭐ Featured</strong>, <strong className="text-rose-600 dark:text-rose-400">🔥 Best Sellers</strong>, aur <strong className="text-indigo-600 dark:text-indigo-400">✨ New Arrivals</strong>) mein show hone wale products ko yahan se control karein. Neeche table mein kisi bhi badge par 1-click karein to wo instantly enable/disable ho jayega.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs rounded-2xl hover:bg-primary-500/20 transition cursor-pointer border border-primary-500/20"
                >
                  <RiAddLine className="w-4 h-4" /> Add Category
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-2xl hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                  <RiAddLine className="w-4 h-4" /> Add New Product
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
                <RiFilter3Line className="w-3.5 h-3.5" /> Filter by:
              </span>

              <button
                onClick={() => setProductBadgeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  productBadgeFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Products ({totalProductsCount})
              </button>

              <button
                onClick={() => setProductBadgeFilter('featured')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  productBadgeFilter === 'featured'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-100'
                }`}
              >
                <RiStarFill className="w-3.5 h-3.5" />
                Featured ({featuredCount})
              </button>

              <button
                onClick={() => setProductBadgeFilter('bestsellers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  productBadgeFilter === 'bestsellers'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-100'
                }`}
              >
                <RiFireFill className="w-3.5 h-3.5" />
                Best Sellers ({bestSellerCount})
              </button>

              <button
                onClick={() => setProductBadgeFilter('newarrivals')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  productBadgeFilter === 'newarrivals'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-100'
                }`}
              >
                <RiSparklingFill className="w-3.5 h-3.5" />
                New Arrivals ({newArrivalCount})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by title, brand, or category..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <RiSearchLine className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong> of {totalProductsCount} products
            </div>
          </div>

          {/* Products Table with 1-Click Badge Toggles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-950/40">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-center">Home Showcase Badges (1-Click Toggle)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                        No products found matching your filter or search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {p.image || p.images?.[0] ? (
                              <img
                                src={p.image || p.images[0]}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 text-slate-400">
                                <RiShoppingBag3Line className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">{p.brand || 'AeroStore'}</span>
                                <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">ID: {p.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="capitalize px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          AED {p.discountPrice || p.price}
                          {p.discountPrice && p.discountPrice < p.price && (
                            <span className="ml-1.5 text-xs text-slate-400 line-through">AED {p.price}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              p.stock > 5
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : p.stock > 0
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Toggle Featured */}
                            <button
                              type="button"
                              onClick={() => toggleProductBadge(p.id, 'isFeatured')}
                              title={p.isFeatured ? 'Click to remove from Featured section' : 'Click to feature on Home page'}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                p.isFeatured
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 shadow-2xs'
                                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                              }`}
                            >
                              {p.isFeatured ? <RiStarFill className="w-3.5 h-3.5 text-amber-500" /> : <RiStarLine className="w-3.5 h-3.5" />}
                              <span>Featured</span>
                            </button>

                            {/* Toggle Best Seller */}
                            <button
                              type="button"
                              onClick={() => toggleProductBadge(p.id, 'isBestSeller')}
                              title={p.isBestSeller ? 'Click to remove from Best Sellers' : 'Click to mark as Best Seller'}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                p.isBestSeller
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 shadow-2xs'
                                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                              }`}
                            >
                              {p.isBestSeller ? <RiFireFill className="w-3.5 h-3.5 text-rose-500" /> : <RiFireLine className="w-3.5 h-3.5" />}
                              <span>Best Seller</span>
                            </button>

                            {/* Toggle New Arrival */}
                            <button
                              type="button"
                              onClick={() => toggleProductBadge(p.id, 'isNewArrival')}
                              title={p.isNewArrival ? 'Click to remove from New Arrivals' : 'Click to mark as New Arrival'}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                p.isNewArrival
                                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 shadow-2xs'
                                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
                              }`}
                            >
                              {p.isNewArrival ? <RiSparklingFill className="w-3.5 h-3.5 text-indigo-500" /> : <RiSparklingLine className="w-3.5 h-3.5" />}
                              <span>New</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl transition cursor-pointer"
                              title="Edit Product & Details"
                            >
                              <RiEdit2Line className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/product/${p.id}`}
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                              title="View on Store"
                            >
                              <RiEyeLine className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => deleteProduct(p.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                              title="Delete Product"
                            >
                              <RiDeleteBinLine className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
              {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-400 text-sm">No orders found matching this filter.</p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{ord.orderId}</span>
                      <span className="text-xs text-slate-400">• {ord.date}</span>
                      {getStatusBadge(ord.status)}
                      {((typeof ord.paymentMethod === 'string' && ord.paymentMethod.toLowerCase().includes('cash')) || 
                        (typeof ord.paymentMethod === 'object' && ord.paymentMethod?.method?.toLowerCase().includes('cash'))) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          💵 Cash on Delivery
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          💳 Card Payment
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Customer:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {ord.customerName || 
                         (ord.shippingDetails 
                           ? (ord.shippingDetails.fullName || `${ord.shippingDetails.firstName || ''} ${ord.shippingDetails.lastName || ''}`.trim() || ord.shippingDetails.email || 'Customer') 
                           : 'Customer')}
                      </span>
                      {ord.shippingDetails?.phone && (
                        <span className="text-slate-400 ml-2 font-mono">({ord.shippingDetails.phone})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                      {ord.items?.map((it, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {it.quantity}x {it.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Amount</p>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        AED {ord.totals?.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.orderId, e.target.value)}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: USERS & ROLES (SUPER ADMIN ONLY) */}
      {activeTab === 'users' && user?.role === 'superadmin' && (
        <div className="space-y-6 text-left">
          <div className="bg-white dark:bg-slate-900 border border-purple-500/20 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  ⚡ Super Admin Access Only
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Database Users & Roles Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Database ke sabhi registered users yahan show hotay hain. Super Admin kisi bhi user ka role change kar sakta hai.
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <RiRefreshLine className="w-3.5 h-3.5" /> Refresh Users
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4 text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {dbUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">User #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'superadmin'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                            : u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {u.role === 'superadmin' ? '⚡ Super Admin' : u.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        >
                          <option value="superadmin">⚡ Super Admin</option>
                          <option value="admin">👑 Admin</option>
                          <option value="customer">👤 Customer</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Product</h3>
                <p className="text-xs text-slate-400 mt-0.5">Naya product add karein aur uski homepage section access set karein</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. AeroSound Elite Wireless Headphones"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    placeholder="e.g. AeroSound"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-0.5 cursor-pointer"
                    >
                      <RiAddLine className="w-3.5 h-3.5" /> + Add Category
                    </button>
                  </div>
                  <select
                    value={newProd.category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsCategoryModalOpen(true);
                      } else {
                        setNewProd({ ...newProd, category: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 capitalize focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__add_new__" className="font-bold text-primary-600">
                      + Add New Category...
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Price (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="199.99"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Discount Price (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProd.discountPrice}
                    onChange={(e) => setNewProd({ ...newProd, discountPrice: e.target.value })}
                    placeholder="169.99"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Product Image URL & Upload */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Product Image (URL ya Computer se File Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newProd.image}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                    placeholder="Storage path (e.g. /storage/...) ya computer se upload karein"
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="file"
                    ref={addImgInputRef}
                    onChange={handleAddImgUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingAddImg}
                    onClick={() => addImgInputRef.current && addImgInputRef.current.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RiUploadCloud2Line className="w-4 h-4" />
                    {isUploadingAddImg ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                {newProd.image && (
                  <div className="flex items-center gap-3 mt-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <img
                      src={newProd.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 truncate">{newProd.image}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Image Ready</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Page Showcase Section Access Badges */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Home Page Section Access (Select where this product will appear):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    newProd.isFeatured
                      ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!newProd.isFeatured}
                      onChange={(e) => setNewProd({ ...newProd, isFeatured: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs font-bold flex items-center gap-1">
                      <RiStarFill className="w-3.5 h-3.5 text-amber-500" /> Featured
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    newProd.isBestSeller
                      ? 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!newProd.isBestSeller}
                      onChange={(e) => setNewProd({ ...newProd, isBestSeller: e.target.checked })}
                      className="rounded text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs font-bold flex items-center gap-1">
                      <RiFireFill className="w-3.5 h-3.5 text-rose-500" /> Best Seller
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    newProd.isNewArrival
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!newProd.isNewArrival}
                      onChange={(e) => setNewProd({ ...newProd, isNewArrival: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-indigo-400"
                    />
                    <span className="text-xs font-bold flex items-center gap-1">
                      <RiSparklingFill className="w-3.5 h-3.5 text-indigo-500" /> New Arrival
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Describe key features, specs, and materials..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Product Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Product attributes aur Home page section access modify karein</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. AeroSound Max"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="e.g. AeroSound"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-0.5 cursor-pointer"
                    >
                      <RiAddLine className="w-3.5 h-3.5" /> + Add Category
                    </button>
                  </div>
                  <select
                    value={editingProduct.category || 'electronics'}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsCategoryModalOpen(true);
                      } else {
                        setEditingProduct({ ...editingProduct, category: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 capitalize focus:outline-hidden focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__add_new__" className="font-bold text-primary-600">
                      + Add New Category...
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Price (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    placeholder="199.99"
                    className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Discount Price (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value })}
                    placeholder="169.99"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Product Image URL & Upload */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Product Image (URL ya File Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="Storage path (e.g. /storage/...) ya computer se upload karein"
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="file"
                    ref={editImgInputRef}
                    onChange={handleEditImgUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingEditImg}
                    onClick={() => editImgInputRef.current && editImgInputRef.current.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RiUploadCloud2Line className="w-4 h-4" />
                    {isUploadingEditImg ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                {editingProduct.image && (
                  <div className="flex items-center gap-3 mt-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 truncate">{editingProduct.image}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Active Image</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Page Showcase Section Access Badges */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Home Page Section Access (Select where this product will appear):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    editingProduct.isFeatured
                      ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isFeatured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs font-bold flex items-center gap-1">
                      <RiStarFill className="w-3.5 h-3.5 text-amber-500" /> Featured
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    editingProduct.isBestSeller
                      ? 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isBestSeller}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                      className="rounded text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs font-bold flex items-center gap-1">
                      <RiFireFill className="w-3.5 h-3.5 text-rose-500" /> Best Seller
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    editingProduct.isNewArrival
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isNewArrival}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                      className="rounded text-indigo-500 focus:ring-indigo-400"
                    />
                    <span className="text-xs font-bold flex items-center gap-1">
                      <RiSparklingFill className="w-3.5 h-3.5 text-indigo-500" /> New Arrival
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Describe key features, specs, and materials..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Category</h3>
                <p className="text-xs text-slate-400 mt-0.5">Nayi product category create karein</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  placeholder="e.g. Gaming, Perfumes, Smart Home, Watches"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Category Image (Computer se File Upload ya Storage URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCatForm.image}
                    onChange={(e) => setNewCatForm({ ...newCatForm, image: e.target.value })}
                    placeholder="/storage/upload-... ya Image URL"
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="file"
                    ref={catImgInputRef}
                    onChange={handleCatImgUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingCatImg}
                    onClick={() => catImgInputRef.current && catImgInputRef.current.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RiUploadCloud2Line className="w-4 h-4" />
                    {isUploadingCatImg ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                {newCatForm.image && (
                  <div className="flex items-center gap-3 mt-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <img
                      src={newCatForm.image}
                      alt="Category Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 truncate">{newCatForm.image}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Saved in /storage/</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows="2"
                  value={newCatForm.description}
                  onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                  placeholder="Short description of this category..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <RiAddLine className="w-4 h-4" /> Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

