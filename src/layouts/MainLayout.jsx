import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastContainer from '../components/Toast';
import OrderChatbot from '../components/OrderChatbot';

const setMetaTag = (attr, key, val) => {
  if (!val) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', val);
};

const MainLayout = () => {
  const location = useLocation();
  const { seoSettings, storeName } = useApp();

  // Dynamic route-specific SEO synchronization
  useEffect(() => {
    const path = location.pathname;

    // Skip product detail page (ProductDetails component sets individual product SEO & schema)
    if (path.startsWith('/product/')) return;

    // Determine current route key
    let pageKey = null;
    if (path === '/' || path === '') pageKey = 'home';
    else if (path === '/shop') pageKey = 'shop';
    else if (path === '/about') pageKey = 'about';
    else if (path === '/contact') pageKey = 'contact';
    else if (path === '/faq') pageKey = 'faq';

    const pageSeo = (pageKey && seoSettings?.pages?.[pageKey]) || null;
    const siteUrl = seoSettings?.siteUrl || 'https://aerostore.com';

    // 1. Meta Title
    const activeTitle = pageSeo?.metaTitle || (
      pageKey === 'home'
        ? seoSettings?.metaTitle || 'Vanta Dubai - Handcrafted Luxury & Modern Essentials | Dubai'
        : path === '/cart'
        ? `Shopping Bag | ${storeName || 'Vanta Dubai'}`
        : path === '/checkout'
        ? `Checkout | ${storeName || 'Vanta Dubai'}`
        : path === '/orders'
        ? `My Orders | ${storeName || 'Vanta Dubai'}`
        : path === '/admin'
        ? `Admin Dashboard | ${storeName || 'Vanta Dubai'}`
        : `${storeName || 'Vanta Dubai'} | Handcrafted Luxury`
    );
    document.title = activeTitle;

    // 2. Meta Description
    const activeDesc = pageSeo?.metaDescription || seoSettings?.metaDescription || 'Discover handcrafted luxury and modern essentials at Vanta Dubai.';
    setMetaTag('name', 'description', activeDesc);

    // 3. Meta Keywords
    const activeKeywords = pageSeo?.metaKeywords || seoSettings?.metaKeywords || 'ecommerce, luxury, electronics, uae, dubai';
    setMetaTag('name', 'keywords', activeKeywords);

    // 4. Canonical URL
    const activeCanonical = pageSeo?.canonicalUrl || `${siteUrl}${path}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', activeCanonical);

    // 5. OpenGraph Tags
    const activeOgTitle = pageSeo?.ogTitle || pageSeo?.metaTitle || activeTitle;
    const activeOgDesc = pageSeo?.ogDescription || pageSeo?.metaDescription || activeDesc;
    const activeOgImage = pageSeo?.ogImageUrl || seoSettings?.ogImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80';

    setMetaTag('property', 'og:title', activeOgTitle);
    setMetaTag('property', 'og:description', activeOgDesc);
    setMetaTag('property', 'og:url', activeCanonical);
    setMetaTag('property', 'og:image', activeOgImage);

    // 6. Twitter Card Tags
    setMetaTag('name', 'twitter:title', activeOgTitle);
    setMetaTag('name', 'twitter:description', activeOgDesc);
    setMetaTag('name', 'twitter:image', activeOgImage);
  }, [location.pathname, seoSettings, storeName]);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden w-full max-w-full">
      {/* Sticky header navbar */}
      <Navbar />

      {/* Main page content shell with loading Suspense boundary */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {/* Structured Footer */}
      <Footer />

      {/* Float Toasts Portal Container */}
      <ToastContainer />

      {/* Floating Order Tracking Chatbot */}
      <OrderChatbot />
    </div>
  );
};

export default MainLayout;
