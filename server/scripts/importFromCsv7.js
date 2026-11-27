import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { 
  mysqlPool, 
  isMysql 
} from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  if (c.includes('toy')) return 'gaming';
  if (c.includes('beauty') || c.includes('fragrance') || c.includes('oil')) return 'beauty';
  if (c.includes('health') || c.includes('exercise') || c.includes('fitness')) return 'wellness';
  if (c.includes('watch') || c.includes('jewel')) return 'watches';
  if (c.includes('tool')) return 'tools';
  if (c.includes('home') || c.includes('kitchen')) return 'home-decor';
  if (c.includes('glass') || c.includes('cloth') || c.includes('fashion') || c.includes('apparel')) return 'fashion';
  if (c.includes('uae') || c.includes('saudi') || c.includes('luxury')) return 'luxury';
  if (c.includes('gadget') || c.includes('electronic') || c.includes('mobile') || c.includes('laptop')) return 'electronics';
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

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r') + "'";
}

async function run() {
  console.log('====================================================');
  console.log('🚀 IMPORTING ALL PRODUCTS FROM arabiadropship_products (7).csv');
  console.log('====================================================');

  const csvPath = path.resolve(__dirname, '..', '..', 'arabiadropship_products (7).csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const allRows = parseCsv(csvPath);
  const dataRows = allRows.slice(1);
  console.log(`Parsed ${dataRows.length} product rows from CSV.`);

  // 1. Prepare products
  const productsToInsert = [];
  const existingNames = new Set();
  const categoryCounter = {};

  for (let idx = 0; idx < dataRows.length; idx++) {
    const row = dataRows[idx];
    const overallIdx = idx + 1;

    const rawCategory = row[0] || 'Gadgets';
    let rawTitle = cleanString(row[1] || `Premium Product #${overallIdx}`);
    const rawPrice = row[2] || '';
    const rawSalePrice = row[10] || '';
    const rawDesc = cleanString(row[5] || '');
    const rawImagesStr = row[6] || '';

    const catId = mapCategory(rawCategory);
    const catCode = getCatCode(catId);
    
    categoryCounter[catCode] = (categoryCounter[catCode] || 0) + 1;
    const generatedSku = `VNT-${catCode}-${String(categoryCounter[catCode]).padStart(4, '0')}`;

    // Clean Title
    let title = rawTitle;
    if (existingNames.has(title.toLowerCase())) {
      title = `${title} (${String(categoryCounter[catCode]).padStart(3, '0')})`;
    }
    existingNames.add(title.toLowerCase());

    // Images
    const allUrls = rawImagesStr.split('|').map(u => u.trim()).filter(u => u.startsWith('http'));
    const finalImages = allUrls.length > 0 
      ? allUrls.slice(0, 8) 
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];
    const finalImageStr = JSON.stringify(finalImages);

    // Price
    let numPrice = parseFloat(rawSalePrice) || parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 29.00;
    if (numPrice <= 0) numPrice = 29.00;
    const salePrice = Math.round(numPrice);
    const hasDiscount = (overallIdx % 3 !== 0);
    const regularPrice = hasDiscount ? Math.round(salePrice * (1.15 + (overallIdx % 15) * 0.01)) : salePrice;
    const discountPrice = hasDiscount ? salePrice : null;

    // Description
    let description = rawDesc;
    if (!description || description.length < 15) {
      description = `${title} is crafted with superior craftsmanship, designed to bring modern aesthetic and reliable functionality to your everyday lifestyle in the UAE.`;
    }

    const isFeatured = (overallIdx % 7 === 0) ? 1 : 0;
    const isBestSeller = (overallIdx % 5 === 0) ? 1 : 0;
    const isNew = (overallIdx % 4 === 0) ? 1 : 0;

    const colors = COLOR_PRESETS[overallIdx % COLOR_PRESETS.length];
    const stock = 15 + (overallIdx % 65);
    const prodId = crypto.randomUUID();
    const brand = `VANTA ${catCode}`;

    productsToInsert.push({
      id: prodId,
      sku: generatedSku,
      name: title,
      brand,
      category: catId,
      price: regularPrice,
      discount_price: discountPrice,
      stock,
      colors: JSON.stringify(colors),
      image: finalImageStr,
      alt_text: title,
      description,
      is_featured: isFeatured,
      is_bestseller: isBestSeller,
      is_new: isNew
    });
  }

  console.log(`Prepared ${productsToInsert.length} products ready for insertion.`);

  // 2. Generate SQL file for Hostinger migration
  const sqlStatements = [];
  sqlStatements.push('-- Vanta Dubai - Full Products Replacement from CSV (7)');
  sqlStatements.push('SET FOREIGN_KEY_CHECKS = 0;');
  sqlStatements.push('TRUNCATE TABLE products;');
  
  const BATCH_SIZE = 50;
  for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
    const chunk = productsToInsert.slice(i, i + BATCH_SIZE);
    const valuesRows = chunk.map(p => {
      return `(${escapeSql(p.id)}, ${escapeSql(p.sku)}, ${escapeSql(p.name)}, ${escapeSql(p.brand)}, ${escapeSql(p.category)}, ${p.price}, ${p.discount_price !== null ? p.discount_price : 'NULL'}, ${p.stock}, ${escapeSql(p.colors)}, ${escapeSql(p.image)}, ${escapeSql(p.alt_text)}, ${escapeSql(p.description)}, ${p.is_featured}, ${p.is_bestseller}, ${p.is_new})`;
    }).join(',\n');

    sqlStatements.push(`INSERT INTO products (id, sku, name, brand, category, price, discount_price, stock, colors, image, alt_text, description, is_featured, is_bestseller, is_new) VALUES\n${valuesRows};`);
  }

  sqlStatements.push(`UPDATE categories c SET count = (SELECT COUNT(*) FROM products p WHERE p.category = c.id);`);
  sqlStatements.push('SET FOREIGN_KEY_CHECKS = 1;');

  const sqlFilePath = path.resolve(__dirname, '..', '..', 'update_products_new.sql');
  fs.writeFileSync(sqlFilePath, sqlStatements.join('\n\n'), 'utf8');
  console.log(`[SQL GENERATED] Generated standalone SQL dump at: ${sqlFilePath}`);

  // 3. Insert into MySQL (if connected)
  if (isMysql && mysqlPool) {
    try {
      console.log('Connecting to MySQL database...');
      const [existingCount] = await mysqlPool.query('SELECT COUNT(*) as count FROM products');
      console.log(`Deleting ${existingCount[0].count} old products from MySQL table...`);
      await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 0');
      await mysqlPool.query('TRUNCATE TABLE products');

      console.log(`Inserting ${productsToInsert.length} new products into MySQL...`);
      for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
        const chunk = productsToInsert.slice(i, i + BATCH_SIZE);
        const query = `
          INSERT INTO products (
            id, sku, name, brand, category, price, discount_price, stock, colors, image, alt_text, description, is_featured, is_bestseller, is_new
          ) VALUES ?
        `;
        const values = chunk.map(p => [
          p.id, p.sku, p.name, p.brand, p.category, p.price, p.discount_price, p.stock, p.colors, p.image, p.alt_text, p.description, p.is_featured, p.is_bestseller, p.is_new
        ]);
        await mysqlPool.query(query, [values]);
      }

      await mysqlPool.query(`
        UPDATE categories c 
        SET count = (SELECT COUNT(*) FROM products p WHERE p.category = c.id)
      `);
      await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 1');

      const [newCount] = await mysqlPool.query('SELECT COUNT(*) as count FROM products');
      const [catStats] = await mysqlPool.query('SELECT id, name, count FROM categories ORDER BY count DESC');

      console.log('====================================================');
      console.log(`✅ SUCCESS! New product count in MySQL: ${newCount[0].count}`);
      console.table(catStats);
      console.log('====================================================');
    } catch (dbErr) {
      console.error('[MySQL ERROR]:', dbErr);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error('[FATAL]:', err);
  process.exit(1);
});
