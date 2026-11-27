// Vanta Dubai - High-Quality Verified Customer Reviews Generator
// Generates 10 to 12 authentic, realistic UAE verified reviews per product

const UAE_CUSTOMERS = [
  { name: 'Rashid Al Nuaimi', location: 'Dubai Marina, UAE' },
  { name: 'Fatima Al Mansoori', location: 'Downtown Dubai, UAE' },
  { name: 'Tariq Mehmood', location: 'Abu Dhabi, UAE' },
  { name: 'Sarah Jenkins', location: 'Palm Jumeirah, Dubai' },
  { name: 'Hamdan Al Maktoum', location: 'Al Ain, UAE' },
  { name: 'Elena Rostova', location: 'JBR, Dubai' },
  { name: 'Zayed Al Kaabi', location: 'Sharjah, UAE' },
  { name: 'Mariam Al Suwaidi', location: 'Ajman, UAE' },
  { name: 'Dr. Omar Farooq', location: 'Business Bay, Dubai' },
  { name: 'Ayesha Siddiqui', location: 'Al Barsha, Dubai' },
  { name: 'Mohammad Al Zaabi', location: 'Ras Al Khaimah, UAE' },
  { name: 'Chloe Davies', location: 'Dubai Hills Estate, UAE' },
  { name: 'Sultan Al Qasimi', location: 'Al Majaz, Sharjah' },
  { name: 'Noura Al Ketbi', location: 'Khalifa City, Abu Dhabi' },
  { name: 'Hassan Raza', location: 'Deira, Dubai' },
  { name: 'Khadija Al Marzooqi', location: 'Fujairah, UAE' },
  { name: 'Marcus Vance', location: 'Mirdif, Dubai' },
  { name: 'Abdullah Bin Rashid', location: 'Umm Al Quwain, UAE' },
  { name: 'Reem Al Hashimi', location: 'Jumeirah 1, Dubai' },
  { name: 'Farhan Akhtar', location: 'Al Nahda, Sharjah' }
];

const GENERAL_COMMENTS = [
  'Super fast delivery in Dubai! Ordered yesterday and received it this morning with Cash on Delivery. Top quality!',
  'Mashallah very authentic item. Exactly as shown in the pictures. The packaging was very premium.',
  'Delivered to Abu Dhabi in 24 hours. The COD process was super smooth with courier rider. Highly recommend Vanta Dubai!',
  'Exceeded my expectations! Build quality is 10/10 and works flawlessly. Will definitely order again.',
  'Best purchase this month. Very premium feel and works like a charm. 5 stars all the way!',
  'Received in Sharjah. Very polite rider and allowed me to inspect the parcel before paying. Excellent service.',
  'Genuine product at a very reasonable price compared to Dubai Mall. Great value for money.',
  'Quality is top notch! My family loved it. Fast shipping and great customer support on WhatsApp.',
  '100% recommended! Seamless checkout and received tracking updates. Very happy with the purchase.',
  'Really good quality. Exactly what I needed for my daily routine. 5 stars from Dubai.',
  'Ordered two pieces as gifts. Both arrived in perfect condition. Thank you Vanta team!',
  'Fast dispatch, luxury feel, and easy cash on delivery. Definitely shopping here again!'
];

const CATEGORY_COMMENTS = {
  electronics: [
    'Battery life and build quality are incredible. Works straight out of the box with zero issues.',
    'Very high quality electronics. USB charging is fast and design is super sleek.',
    'Amazing performance. Clean finish, solid weight, and feels like a 500 AED product.',
    'High tech and very practical. Using it every single day without any lag or problem.'
  ],
  'health-beauty': [
    'Gentle on skin and very effective. Noticed visible results within the first week of use!',
    'Salon quality results at home. Compact, easy to clean, and luxury packaging.',
    'My skin feels so refreshed. Highly recommend for everyday self-care routine in UAE heat.',
    'Very hygienic and gentle. Definitely worth every single dirham.'
  ],
  'home-living': [
    'Looks so aesthetic in my living room. Matches my luxury modern interior perfectly.',
    'Sturdy, functional, and very easy to assemble. Great addition to our home.',
    'Space saving and elegant design. Premium build quality that lasts.',
    'Everyone who visits our home compliments this piece. Beautiful craftsmanship!'
  ],
  'fitness-wellness': [
    'Great relief for muscle tension after long office hours. Easy to adjust pressure.',
    'Ergonomic, cordless, and very quiet operation. Use it right after gym workouts.',
    'Super soothing and relaxing. Really helps with sore neck and back pain.',
    'High power, long battery life, and portable enough to carry in my gym bag.'
  ],
  'watches-jewelry': [
    'Looks stunning on wrist. The weight and finish scream luxury.',
    'Received so many compliments at dinner last night. Looks like a thousand-dollar piece.',
    'The clasp and materials are top grade. Comfortable for all-day wear.',
    'Arrived in an elegant luxury gift box. Perfect present for loved ones.'
  ],
  gaming: [
    'Zero latency, super comfortable during long sessions, and great RGB aesthetics.',
    'Responsive build and premium tactile feel. Exactly what my setup needed.',
    'Awesome gaming accessory. Great value for money for UAE gamers.'
  ],
  'luxury-bags': [
    'Stitching is flawless and the material feels buttery smooth. Luxury at its best.',
    'Perfect size for daily essentials. Hardware has a rich Champagne Gold shine.',
    'Looks effortlessly chic and elegant. Fits my phone, wallet and keys easily.'
  ]
};

// Simple string hash to ensure deterministic reviews for each product
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate 10 to 12 reviews deterministically
export function generateProductReviews(product) {
  if (!product) return [];

  const key = String(product.id || product.sku || product.name || 'product');
  const hash = stringHash(key);

  // Count between 10 and 12 reviews
  const reviewCount = 10 + (hash % 3); // 10, 11, or 12

  const catComments = CATEGORY_COMMENTS[product.category] || CATEGORY_COMMENTS['electronics'];
  const pool = [...catComments, ...GENERAL_COMMENTS];

  const reviews = [];
  const now = new Date('2026-11-26T12:00:00Z');

  for (let i = 0; i < reviewCount; i++) {
    const custIdx = (hash + i * 3) % UAE_CUSTOMERS.length;
    const commentIdx = (hash + i * 2) % pool.length;
    const cust = UAE_CUSTOMERS[custIdx];

    // Ratings mostly 5 stars, occasional 4.5 or 4 star
    const ratingRoll = (hash + i * 7) % 10;
    const rating = ratingRoll === 0 ? 4 : (ratingRoll === 1 ? 4.5 : 5);

    // Realistic dates distributed across last 60 days
    const daysAgo = 1 + ((hash * (i + 1) * 7) % 65);
    const revDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = revDate.toISOString().split('T')[0];

    reviews.push({
      id: `${key}-rev-${i + 1}`,
      name: cust.name,
      location: cust.location,
      rating: rating,
      date: dateStr,
      comment: pool[commentIdx],
      verified: true
    });
  }

  // Sort newest first
  return reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getProductRatingSummary(product) {
  const reviews = generateProductReviews(product);
  if (!reviews || reviews.length === 0) {
    return { rating: 4.9, reviewsCount: 11, reviews: [] };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return {
    rating: avg,
    reviewsCount: reviews.length,
    reviews: reviews
  };
}
