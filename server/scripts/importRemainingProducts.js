import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import crypto from 'crypto';
import { 
  mysqlPool, 
  isMysql 
} from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '..', '..', 'storage', 'uploads');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

process.on('unhandledRejection', (reason) => {
  console.warn('[WARN Unhandled Rejection]:', reason?.message || reason);
});

const COLOR_PRESETS = [
  ["#0F172A", "#334155", "#94A3B8"],
  ["#1E293B", "#3B82F6", "#93C5FD"],
  ["#065F46", "#10B981", "#A7F3D0"],
  ["#831843", "#EC4899", "#FBCFE8"],
  ["#78350F", "#F59E0B", "#FDE68A"],
  ["#312E81", "#6366F1", "#C7D2FE"],
  ["#18181B", "#71717A", "#E4E4E7"],
  ["#172554", "#1E40AF", "#60A5FA"],
  ["#451A03", "#B45309", "#FBBF24"]
];

function mapCategory(rawCat) {
  const c = (rawCat || '').trim().toLowerCase();
  if (c.includes('gaming')) return 'gaming';
  if (c.includes('beauty') || c.includes('fragrance') || c.includes('oils')) return 'beauty';
  if (c.includes('gadgets') || c.includes('electronics') || c.includes('mobile')) return 'electronics';
  if (c.includes('home & kitchen') || c.includes('home')) return 'home-decor';
  if (c.includes('tools')) return 'tools';
  if (c.includes('exercise') || c.includes('health')) return 'wellness';
  if (c.includes('watch') || c.includes('jewellery')) return 'watches';
  if (c.includes('glasses') || c.includes('clothing')) return 'fashion';
  if (c.includes('kid toy') || c.includes('toy')) return 'gaming';
  if (c.includes('uae')) return 'luxury';
  return 'electronics';
}

function getCatCode(catId) {
  const map = {
    'electronics': 'ELE',
    'beauty': 'BTY',
    'home-decor': 'HME',
    'tools': 'TLS',
    'wellness': 'WLN',
    'watches': 'WTC',
    'fashion': 'FSH',
    'gaming': 'GAM',
    'luxury': 'LUX'
  };
  return map[catId] || 'VNT';
}

function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/^[?\-–—•*\s:：]+/, '')
    .trim();
}

function extractCleanTitle(rawTitle, rawDesc, rawCategory, imageUrl, idx) {
  const genericTitles = [
    'item added to cart successfully!',
    'item added to cart successfully',
    'about this item',
    'about this',
    'about',
    'product details',
    'features',
    'specifications',
    'specification',
    'description',
    'in stock',
    'in'
  ];

  // 0. A real scraped title (scraper v1.2+) always wins.
  if (rawTitle) {
    const t = cleanString(rawTitle);
    const l = t.toLowerCase();
    if (t.length > 4 && !genericTitles.includes(l) && !l.startsWith('about this item') && !/added to cart/i.test(l)) {
      return t;
    }
  }

  // 1. Try extracting from image slug if informative
  if (imageUrl) {
    const filename = imageUrl.split('/').pop().split('?')[0];
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const cleanSlug = nameWithoutExt
      .replace(/[_-][a-f0-9]{8,}$/i, '')
      .replace(/[_-]\d+-\d+$/, '')
      .replace(/[_-]\d+$/, '')
      .replace(/^[0-9]+_/g, '')
      .replace(/[._-]+/g, ' ')
      .trim();

    const words = cleanSlug.split(' ').filter(w => /[a-z]/i.test(w) && w.length > 1);
    if (words.length >= 2 && cleanSlug.length >= 6 && !/^[0-9a-f]+$/i.test(cleanSlug)) {
      const formatted = words.map(w => {
        if (/^(1080p|4k|hd|usb|led|rgb|diy|tws|rc|3d)$/i.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }).join(' ');
      if (formatted.length >= 6 && formatted.length <= 80) {
        return formatted;
      }
    }
  }

  // 2. If rawTitle is valid and not generic
  if (rawTitle) {
    const trimmedTitle = cleanString(rawTitle);
    const lower = trimmedTitle.toLowerCase();
    if (!genericTitles.includes(lower) && !lower.startsWith('about this item') && trimmedTitle.length > 4) {
      return trimmedTitle;
    }
  }

  // 3. Try from description
  let desc = cleanString(rawDesc);
  if (desc.toLowerCase().startsWith('about this item')) {
    desc = desc.slice(15).trim();
  }

  if (desc) {
    const bracketMatch = desc.match(/[【\[]([^】\]]+)[】\]]/);
    if (bracketMatch && bracketMatch[1] && bracketMatch[1].trim().length >= 4) {
      let t = bracketMatch[1].trim().replace(/[:：,\-–—]+$/, '').trim();
      if (t.length >= 4 && t.length <= 80) return t;
    }

    const firstLine = desc.split(/[\r\n]+/)[0] || '';
    const colonMatch = firstLine.match(/^([A-Za-z0-9\s/&+\-–'’()]{5,70})[:：|–—]/);
    if (colonMatch && colonMatch[1]) {
      let t = colonMatch[1].trim();
      const lower = t.toLowerCase();
      if (!genericTitles.includes(lower) && t.length >= 6) {
        return t;
      }
    }

    const firstSentence = firstLine.split(/[.?!\r\n]+/)[0] || '';
    if (firstSentence.length >= 8 && firstSentence.length <= 65) {
      return firstSentence.trim();
    }
  }

  return `Vanta ${rawCategory} Luxury Series #${idx}`;
}

function parsePrice(raw) {
  if (!raw) return 29.00;
  const match = String(raw).match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (val > 0) return Math.round(val);
  }
  return 29.00;
}

async function downloadAndConvertToWebp(url, filenameBase) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return null;
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 200) return null;

    if (buffer[0] === 0x3C || buffer[0] === 0x7B) {
      return null;
    }

    const targetFilename = `${filenameBase}.webp`;
    const targetPath = path.join(storageDir, targetFilename);

    await sharp(buffer)
      .webp({ quality: 78, effort: 3 })
      .toFile(targetPath);

    return `/uploads/${targetFilename}`;
  } catch (err) {
    return null;
  }
}

function parseCsv(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const rows = [];
  let currentRow = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 1) rows.push(currentRow);
      currentRow = [];
    } else {
      currentField += char;
    }
  }
  if (currentRow.length > 1) rows.push(currentRow);
  return rows;
}

async function run() {
  console.log('--- COMPLETING 100% BULK IMPORT OF ALL PRODUCTS ---');
  if (!isMysql) {
    console.error('MySQL connection is required!');
    process.exit(1);
  }

  // Rename any product named "About this item" in DB
  await mysqlPool.query(`
    UPDATE products 
    SET name = CONCAT('Vanta Luxury Edition ', SUBSTRING(sku, -4))
    WHERE LOWER(name) LIKE '%about this item%' OR name = 'Item Added to Cart Successfully!'
  `);

  const [existingProds] = await mysqlPool.query('SELECT sku, name FROM products');
  const existingSkus = new Set(existingProds.map(p => p.sku));
  const existingNames = new Set(existingProds.map(p => p.name?.toLowerCase().trim()));
  console.log(`Found ${existingProds.length} products already in MySQL.`);

  const csvPath = path.resolve(__dirname, '..', '..', 'arabiadropship_products (2).csv');
  const allRows = parseCsv(csvPath);
  const dataRows = allRows.slice(1);

  const targetRows = dataRows.filter(r => {
    const cat = (r[0] || '').trim();
    return cat.toLowerCase() !== 'gaming';
  });
  console.log(`Total non-gaming products in CSV: ${targetRows.length}`);

  let importedCount = 0;
  let skippedCount = 0;
  const startTime = Date.now();

  const BATCH_SIZE = 8;

  for (let b = 0; b < targetRows.length; b += BATCH_SIZE) {
    const chunk = targetRows.slice(b, b + BATCH_SIZE);

    await Promise.all(chunk.map(async (row, chunkIdx) => {
      const overallIdx = b + chunkIdx + 1;
      const rawCategory = row[0] || '';
      const rawTitle = row[1] || '';
      const rawPrice = row[2] || '';
      const rawDesc = row[5] || '';
      const rawImagesStr = row[6] || '';

      const catId = mapCategory(rawCategory);
      const catCode = getCatCode(catId);
      const generatedSku = `VNT-${catCode}-${String(overallIdx).padStart(4, '0')}`;

      if (existingSkus.has(generatedSku)) {
        skippedCount++;
        return;
      }

      const allUrls = rawImagesStr.split('|').map(u => u.trim()).filter(u => u.startsWith('http'));
      // Keep every gallery image (capped at 20 so one bad row can't explode storage).
      const targetUrls = Array.from(new Set(allUrls)).slice(0, 20);

      let title = extractCleanTitle(rawTitle, rawDesc, rawCategory, targetUrls[0], overallIdx);
      if (existingNames.has(title.toLowerCase().trim())) {
        title = `${title} (${String(overallIdx).padStart(3, '0')})`;
      }

      const localImages = [];
      for (let imgIdx = 0; imgIdx < targetUrls.length; imgIdx++) {
        const fileBase = `vnt-${catCode.toLowerCase()}-${String(overallIdx).padStart(4, '0')}-img-${imgIdx + 1}`;
        const localPath = await downloadAndConvertToWebp(targetUrls[imgIdx], fileBase);
        if (localPath) {
          localImages.push(localPath);
        }
      }

      const finalImages = localImages.length > 0 
        ? localImages 
        : (targetUrls.length > 0 ? targetUrls.slice(0, 1) : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80']);
      const finalImageStr = finalImages.length === 1 ? finalImages[0] : JSON.stringify(finalImages);

      const salePrice = parsePrice(rawPrice);
      const hasDiscount = (overallIdx % 3 !== 0);
      const regularPrice = hasDiscount ? Math.round(salePrice * (1.15 + (overallIdx % 15) * 0.01)) : salePrice;
      const discountPrice = hasDiscount ? salePrice : null;

      let description = cleanString(rawDesc);
      if (!description || description.length < 15 || description.toLowerCase().startsWith('about this item')) {
        description = `${title} is crafted with superior craftsmanship, designed to bring modern aesthetic and reliable functionality to your everyday lifestyle in the UAE.`;
      }

      const isFeatured = (overallIdx % 7 === 0) ? 1 : 0;
      const isBestSeller = (overallIdx % 5 === 0) ? 1 : 0;
      const isNew = (overallIdx % 4 === 0) ? 1 : 0;

      const colors = COLOR_PRESETS[overallIdx % COLOR_PRESETS.length];
      const stock = 20 + (overallIdx % 65);

      const prodId = crypto.randomUUID();
      const brand = `VANTA ${catCode}`;

      try {
        await mysqlPool.query(`
          INSERT INTO products (
            id, sku, name, brand, category, price, discount_price, stock, colors, image, alt_text, description, is_featured, is_bestseller, is_new
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          prodId,
          generatedSku,
          title,
          brand,
          catId,
          regularPrice,
          discountPrice,
          stock,
          JSON.stringify(colors),
          finalImageStr,
          title,
          description,
          isFeatured,
          isBestSeller,
          isNew
        ]);

        existingSkus.add(generatedSku);
        existingNames.add(title.toLowerCase().trim());
        importedCount++;
      } catch (insertErr) {
        console.error(`[DB ERROR] Failed inserting ${generatedSku} - ${title}:`, insertErr.message);
      }
    }));

    await new Promise(r => setTimeout(r, 200));

    const percent = (((b + chunk.length) / targetRows.length) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[PROGRESS] ${b + chunk.length}/${targetRows.length} (${percent}%) | New Imported: ${importedCount} | Skipped: ${skippedCount} | Elapsed: ${elapsedSec}s`);
  }

  // Update categories count in MySQL
  console.log('Updating category product counts...');
  await mysqlPool.query(`
    UPDATE categories c 
    SET count = (SELECT COUNT(*) FROM products p WHERE p.category = c.id)
  `);

  const [totalNow] = await mysqlPool.query('SELECT COUNT(*) as count FROM products');
  const [catStats] = await mysqlPool.query('SELECT id, name, count FROM categories ORDER BY count DESC');

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('====================================================');
  console.log(`ALL CSV PRODUCTS IMPORTED IN ${totalTime}s`);
  console.log(`Imported This Pass: ${importedCount} products`);
  console.log(`Total Products in Database: ${totalNow[0].count}`);
  console.log('Category Counts:');
  console.table(catStats);
  console.log('====================================================');

  process.exit(0);
}

run().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
