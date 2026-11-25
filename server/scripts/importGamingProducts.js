import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { 
  mysqlPool, 
  isMysql, 
  createCategoryInDb, 
  createProduct 
} from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '..', '..', 'storage', 'uploads');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Download remote image and convert to lightweight WebP in KBs
async function downloadAndConvertToWebp(url, filenameBase) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.warn(`[WARN] Failed to fetch image ${url}: status ${res.status}`);
      return url; // fallback
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const targetFilename = `${filenameBase}.webp`;
    const targetPath = path.join(storageDir, targetFilename);

    // Convert to webp with 80 quality for crisp quality and tiny KB file size
    await sharp(buffer)
      .webp({ quality: 80, effort: 4 })
      .toFile(targetPath);

    const stats = fs.statSync(targetPath);
    console.log(`[OK] Saved ${targetFilename} (${(stats.size / 1024).toFixed(1)} KB)`);
    return `/uploads/${targetFilename}`;
  } catch (err) {
    console.error(`[ERROR] Image conversion failed for ${url}:`, err.message);
    return url;
  }
}

const productsData = [
  {
    name: "Golden Boot Sports Collectibles Award Trophy",
    sku: "VNT-GAM-0424",
    brand: "VANTA GAMING",
    category: "gaming",
    price: 26,
    discountPrice: 24,
    stock: 50,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    colors: ["#F59E0B", "#D97706", "#78350F"],
    description: "Makes a great party favor, prize, and collectible decoration. Reminds us of football strength and confidence. Golden shoe height: 17.5cm/6.9inch, length: 20cm/7.9inch with solid weighted base. Includes premium packaging and collectible styling.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/golden-boot-sports-collectibles-award-424-814.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/golden-boot-sports-collectibles-award-424-898.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/golden-boot-sports-collectibles-award-424-659.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/golden-boot-sports-collectibles-award-424-151.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/golden-boot-sports-collectibles-award-424-742.jpg"
    ]
  },
  {
    name: "Kids Cartoon Digital Instant Print Camera",
    sku: "VNT-GAM-0331",
    brand: "VANTA KIDS",
    category: "gaming",
    price: 179,
    discountPrice: 159,
    stock: 35,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    colors: ["#EC4899", "#3B82F6", "#F59E0B"],
    description: "Delightful cartoon toy digital camera with real-time thermal instant photo printing! Features 2.0-inch color HD screen, front and back flip design for easy selfies, expandable memory card support, and rechargeable long-life battery.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/digital-instant-camera-331-622.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/digital-instant-camera-331-391.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/digital-instant-camera-331-975.jpg"
    ]
  },
  {
    name: "Professional HD Binoculars for Kids & Outdoor Exploration",
    sku: "VNT-GAM-0330",
    brand: "VANTA OUTDOORS",
    category: "gaming",
    price: 87,
    discountPrice: 79,
    stock: 40,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    colors: ["#10B981", "#3B82F6", "#1E293B"],
    description: "High-power optical magnification allowing kids to see distant objects in stunning clarity. HD focusing wheel, lightweight compact rubberized armor grip, safe shockproof eye protection, and neck strap.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/professional-binocular-for-kids-330-668.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/professional-binocular-for-kids-330-393.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/professional-binocular-for-kids-330-554.jpg"
    ]
  },
  {
    name: "DIY Screw Puzzle Suitcase STEM Building Toy Set",
    sku: "VNT-GAM-0286",
    brand: "VANTA STEM",
    category: "gaming",
    price: 36,
    discountPrice: null,
    stock: 60,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    colors: ["#F59E0B", "#10B981", "#6366F1"],
    description: "STEM educational building set with electric 3D drill, interchangeable drill bits, wrench, screwdriver, and portable organizer suitcase that doubles as a peg-board. Made of non-toxic, BPA-free ABS plastic.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/diy-screw-puzzle-suitcase-286-340.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/diy-screw-puzzle-suitcase-286-008.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/diy-screw-puzzle-suitcase-286-489.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/diy-screw-puzzle-suitcase-286-598.jpg"
    ]
  },
  {
    name: "Quick Push Pop Sensory Puzzle Game Machine",
    sku: "VNT-GAM-0198",
    brand: "VANTA GAMING",
    category: "gaming",
    price: 10,
    discountPrice: 9,
    stock: 100,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    colors: ["#3B82F6", "#EC4899", "#F59E0B", "#10B981"],
    description: "High-speed pop puzzle game machine with 4 thrilling modes: Mission Mode (30 levels), Memory Mode (9 levels), Scoring Mode (1-minute challenge), and Multiplayer Pass-and-Play mode. Made of flexible, durable silicone.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/quick-push-pop-game-198-655.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/quick-push-pop-game-198-451.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/quick-push-pop-game-198-908.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/quick-push-pop-game-198-976.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/quick-push-pop-game-198-674.jpg"
    ]
  },
  {
    name: "LED Projector Art Drawing Table for Kids",
    sku: "VNT-GAM-0091",
    brand: "VANTA KIDS",
    category: "gaming",
    price: 23,
    discountPrice: 19,
    stock: 45,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    colors: ["#EC4899", "#F59E0B", "#3B82F6"],
    description: "Interactive projection drawing table with music and 3 pattern slides (24 total artwork patterns). Includes projector table, 12 watercolor pens, drawing booklet, and eraser. Perfect for fostering artistic cognition.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/led-projector-art-painting-table-for-kids-91-776.jpg"
    ]
  },
  {
    name: "48-Holes Rocket Bubble Machine Blaster Gun",
    sku: "VNT-GAM-0089",
    brand: "VANTA TOYS",
    category: "gaming",
    price: 22,
    discountPrice: 18,
    stock: 75,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    colors: ["#8B5CF6", "#EC4899", "#3B82F6"],
    description: "High-output 48-hole rocket bubble gun that creates thousands of colorful bubbles per minute with built-in LED lighting. Powered by rechargeable lithium battery. Safe, non-toxic, durable ABS construction.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/48-holes-rocket-bubble-89-428.jpg"
    ]
  },
  {
    name: "VAZILLIO 360° Stunt RC Remote Control Car",
    sku: "VNT-GAM-0073",
    brand: "VANTA RACING",
    category: "gaming",
    price: 52,
    discountPrice: 45,
    stock: 30,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    colors: ["#EF4444", "#3B82F6", "#10B981"],
    description: "Double-sided 360-degree rotation & 180-degree flip tumbling remote control stunt car. High-speed 2.4GHz anti-interference controller with 65ft range, crash-resistant TPR tires, and long-lasting 1200mAh rechargeable battery.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/rc-stunt-car-73-010.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/rc-stunt-car-73-007.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/rc-stunt-car-73-259.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/rc-stunt-car-73-567.jpg"
    ]
  },
  {
    name: "2-in-1 Transform Robot Deformation Vehicle Car",
    sku: "VNT-GAM-0071",
    brand: "VANTA TOYS",
    category: "gaming",
    price: 18,
    discountPrice: 15,
    stock: 80,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    colors: ["#EF4444", "#3B82F6", "#F59E0B"],
    description: "One-button deformation feature that automatically transforms from a racing sports car into a standing warrior robot. Smooth rolling wheels, shockproof ABS body, and vibrant paint finish.",
    rawImages: [
      "https://new.arabiadropship.com/public/assets/images/products/robot-deform-car-71-690.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/robot-deform-car-71-373.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/robot-deform-car-71-193.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/robot-deform-car-71-852.jpg",
      "https://new.arabiadropship.com/public/assets/images/products/robot-deform-car-71-197.jpg"
    ]
  }
];

async function run() {
  console.log('--- Starting Gaming Products Import with WebP Optimization ---');

  // 1. Ensure Gaming category exists in DB
  const categoryBanner = "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80";
  const catWebp = await downloadAndConvertToWebp(categoryBanner, 'category-gaming-banner');

  if (isMysql) {
    await mysqlPool.query(`
      INSERT INTO categories (id, name, icon, image, count, description)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        icon = VALUES(icon), 
        image = VALUES(image), 
        count = VALUES(count),
        description = VALUES(description)
    `, [
      'gaming',
      'Gaming',
      'RiGamepadLine',
      catWebp,
      productsData.length,
      'High-performance gaming gadgets, interactive toys, puzzle devices, and accessories.'
    ]);
  } else {
    createCategoryInDb({
      id: 'gaming',
      name: 'Gaming',
      icon: 'RiGamepadLine',
      image: catWebp,
      count: productsData.length,
      description: 'High-performance gaming gadgets, interactive toys, puzzle devices, and accessories.'
    });
  }
  console.log('[OK] Category "Gaming" created / verified.');

  // 2. Clear any old gaming products if necessary or upsert
  for (let i = 0; i < productsData.length; i++) {
    const item = productsData[i];
    console.log(`\nProcessing (${i + 1}/${productsData.length}): ${item.name}...`);

    const convertedImages = [];
    for (let imgIdx = 0; imgIdx < item.rawImages.length; imgIdx++) {
      const rawUrl = item.rawImages[imgIdx];
      const filenameBase = `${item.sku.toLowerCase()}-img-${imgIdx + 1}`;
      const webpUrl = await downloadAndConvertToWebp(rawUrl, filenameBase);
      convertedImages.push(webpUrl);
    }

    const created = await createProduct({
      sku: item.sku,
      name: item.name,
      brand: item.brand,
      category: item.category,
      price: item.price,
      discountPrice: item.discountPrice,
      stock: item.stock,
      colors: item.colors,
      images: convertedImages,
      altText: item.name,
      description: item.description,
      isFeatured: item.isFeatured,
      isBestSeller: item.isBestSeller,
      isNewArrival: item.isNewArrival
    });

    console.log(`[SUCCESS] Product inserted with ID: ${created.id}, Images: ${convertedImages.length}`);
  }

  // 3. Update Category count
  if (isMysql) {
    await mysqlPool.query('UPDATE categories SET count = ? WHERE id = ?', [productsData.length, 'gaming']);
  }

  console.log('\n--- Import Complete! All 9 Gaming products successfully stored with WebP images in KB size! ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
