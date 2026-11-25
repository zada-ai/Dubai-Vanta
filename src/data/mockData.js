// High-quality mock data for the E-Commerce Web Application

export const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'RiSmartphoneLine',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80',
    count: 24,
    description: 'Smartphones, headphones, smartwatches, and audio gear.'
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    icon: 'RiShirtLine',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
    count: 36,
    description: 'Premium apparel, dresses, and seasonal wear.'
  },
  {
    id: 'luxury',
    name: 'Luxury & Bags',
    icon: 'RiSparkling2Line',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80',
    count: 19,
    description: 'Designer leather handbags, accessories, and totes.'
  },
  {
    id: 'home-decor',
    name: 'Home & Living',
    icon: 'RiHome4Line',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80',
    count: 18,
    description: 'Designer furniture, ceramic vases, and ambient decor.'
  },
  {
    id: 'wellness',
    name: 'Fitness & Wellness',
    icon: 'RiHeartPulseLine',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    count: 15,
    description: 'Activewear, tracking gadgets, and wellness essentials.'
  },
  {
    id: 'beauty',
    name: 'Health & Beauty',
    icon: 'RiHeartPulseLine',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80',
    count: 21,
    description: 'Organic skincare, perfumes, and cosmetic essentials.'
  },
  {
    id: 'tools',
    name: 'Tools & Home Improvement',
    icon: 'RiToolsLine',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&auto=format&fit=crop&q=80',
    count: 15,
    description: 'Professional tools, hardware, and DIY home essentials.'
  },
  {
    id: 'watches',
    name: 'Watches & Jewelry',
    icon: 'RiSparkling2Line',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
    count: 41,
    description: 'Luxury Swiss timepieces, minimalist watches, and jewelry.'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: 'RiGamepadLine',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&auto=format&fit=crop&q=80',
    count: 28,
    description: 'High performance gaming gear, consoles, and accessories.'
  }
];

export const products = [];

export const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Verified Buyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    comment: 'The quality of the Lounge Chair exceeds all my expectations. Delivery was extremely fast, and the customer service was highly professional. 5 stars!',
    rating: 5
  },
  {
    id: 2,
    name: 'David Kojo',
    role: 'Interior Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    comment: 'I recommend this e-commerce site to all my clients. The curated pieces are premium, and the checkout process is smooth and intuitive.',
    rating: 5
  },
  {
    id: 3,
    name: 'Michelle Chen',
    role: 'Tech Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    comment: 'AeroSound Max headphones are absolute gold. Battery life is amazing. Buying from here was a breeze, will shop again!',
    rating: 4.8
  }
];

export const faqs = [
  {
    id: 1,
    category: 'shipping',
    question: 'How long does standard shipping take?',
    answer: 'Standard shipping takes between 3 to 5 business days for domestic orders. Express shipping options are available at checkout, reducing delivery times to 1-2 business days.'
  },
  {
    id: 2,
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 50 countries worldwide. International shipping rates and times vary depending on the destination and are calculated at checkout.'
  },
  {
    id: 3,
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day hassle-free return policy. If you are not satisfied with your purchase, you can return items in their original condition and packaging for a full refund.'
  },
  {
    id: 4,
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and store credit. All transactions are securely encrypted.'
  },
  {
    id: 5,
    category: 'warranty',
    question: 'Do products come with a warranty?',
    answer: 'All electronic items come with a standard 1-year manufacturer warranty covering internal defects. Fitness gear and home decor have a 6-month limited warranty.'
  }
];

export const coupons = [
  { code: 'SAVE10', discountType: 'percentage', value: 10, minSpend: 50 },
  { code: 'FREE50', discountType: 'fixed', value: 50, minSpend: 300 },
  { code: 'WELCOME20', discountType: 'percentage', value: 20, minSpend: 0 }
];

export const teamMembers = [
  {
    name: 'Sophia Sterling',
    role: 'CEO & Founder',
    image: '',
    bio: 'Sophia has over 15 years of retail tech experience and wanted to build a storefront focused on pure product design and quality.'
  },
  {
    name: 'Ethan Brooks',
    role: 'Head of Product Design',
    image: '',
    bio: 'Ethan leads the curation team, ensuring every product on our platform meets high aesthetic and functional standards.'
  },
  {
    name: 'Nisha Patel',
    role: 'Customer Experience Lead',
    image: '',
    bio: 'Nisha is dedicated to making sure every customer leaves our shop satisfied, coordinating our 24/7 client relations department.'
  }
];
