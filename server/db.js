let DatabaseSync = null;
try {
  const sqliteModule = await import('node:sqlite');
  DatabaseSync = sqliteModule.DatabaseSync;
} catch (_) {}
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safe .env loader
function loadEnv() {
  const envPaths = [
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '.env.local'),
    path.resolve(__dirname, '.env')
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      try {
        process.loadEnvFile(p);
        break;
      } catch (_) {
        const content = fs.readFileSync(p, 'utf8');
        content.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            if (!process.env[k]) process.env[k] = v;
          }
        });
        break;
      }
    }
  }
}

loadEnv();

export const isMysql = (process.env.DB_TYPE || 'sqlite').toLowerCase() === 'mysql';

// MySQL Connection Pool (when DB_TYPE=mysql)
export let mysqlPool = null;
if (isMysql) {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aerostore_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// SQLite fallback instance
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = process.env.DB_PATH || path.join(dataDir, 'store.db');
export const sqliteDb = DatabaseSync ? new DatabaseSync(dbPath) : null;
export const db = sqliteDb; // backwards compatibility

// Default Seed Blogs
export const DEFAULT_BLOGS = [
  {
    id: 'b1-aerosound-acoustics',
    title: 'The Art of Pure Acoustics: Inside AeroSound Max',
    slug: 'the-art-of-pure-acoustics-inside-aerosound-max',
    excerpt: 'Discover how custom 40mm titanium drivers and active acoustic tuning create an immersive spatial listening experience in Dubai’s premier audio flagship.',
    content: `Sound is not merely frequency; it is emotion sculpted in air. With the AeroSound Max, our acoustic engineers sought to bridge the gap between studio-grade master tapes and personal daily listening.

### Precision Engineering Meets Acoustic Artistry
At the heart of AeroSound Max lies a pair of custom-developed 40mm titanium-diaphragm transducers. Unlike traditional dynamic drivers that suffer from high-frequency modal distortion, titanium maintains structural rigidity across intense excursions, yielding virtually zero harmonic distortion even at peak volumes.

### Neural Noise Cancellation
Our proprietary Hybrid Active Noise Cancellation utilizes six outward-facing beamforming microphones and dual internal feedback sensors. Sampling ambient acoustic conditions over 380,000 times per second, the digital signal processor creates anti-noise waveforms that dissolve bustling city avenues, flight cabins, and open office reverberations.

### Crafted for Enduring Elegance
Sculpted with anodized aircraft-grade aluminum, ventilated memory foam cushions, and supple top-grain leather trim, every curve honors both ergonomic luxury and acoustic isolation. Welcome to the new zenith of sound.`,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    category: 'Acoustics',
    author: 'Sohaib Mehmood',
    tags: 'AeroSound, Acoustics, High-Fidelity, Dubai, Luxury',
    read_time: '4 min read',
    is_published: 1
  },
  {
    id: 'b2-modern-minimalist-workspaces',
    title: 'Modern Minimalist Workspaces: Curating Luxury & Productivity',
    slug: 'modern-minimalist-workspaces-curating-luxury-and-productivity',
    excerpt: 'Elevate your daily workflow with purposeful aesthetics, ergonomic hardware, and serene Scandinavian-inspired desk setups.',
    content: `Clutter is the enemy of clarity. In today’s hyper-connected environment, curating an intentional, tranquil workspace is not a luxury—it is an essential catalyst for peak creative output.

### 1. The Monochromatic Foundation
Begin by establishing a balanced, muted color palette. Matte black, warm walnut, brushed aluminum, and deep slate harmonize to reduce visual fatigue. Keep desktop surfaces pristine by routing all cables underneath using magnetic channels.

### 2. Tactile Ergonomics & Timeless Materials
Invest in tactile touchpoints. A full-grain leather desk mat offers wrist support while aging gracefully with an organic patina. Couple this with a mechanical keyboard engineered with dampened linear switches for a satisfying, quiet keystroke rhythm.

### 3. Purposeful Illumination
Avoid harsh overhead glare. Instead, employ warm 2700K indirect LED backlights paired with an asymmetrical monitor light bar. The balanced luminance contrast protects circadian rhythms during late-night creative sprints.`,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
    author: 'Vanta Dubai Editorial',
    tags: 'Workspace, Luxury, Minimalism, Design, Productivity',
    read_time: '6 min read',
    is_published: 1
  },
  {
    id: 'b3-anc-demystified',
    title: 'Active Noise Cancellation Demystified: The Science of Silence',
    slug: 'active-noise-cancellation-demystified-the-science-of-silence',
    excerpt: 'An in-depth look at how inverse phase waves, MEMS microphones, and neural noise suppression silence the busiest cityscapes.',
    content: `Silence is not the absence of sound; it is an active physical countermeasure. To comprehend how ANC works, one must explore destructive wave interference.

### The Physics of Destructive Interference
Sound travels through air as pressure waves composed of alternating compressions and rarefactions. When an ambient microphone detects a compression crest, an intelligent digital audio processor calculates an exact inverted wave—a rarefaction trough. When the two waves meet at the ear canal, they cancel each other out completely.

### Feedforward vs Feedback Topologies
Basic noise cancelling systems rely exclusively on feedforward mics placed on the outer earcups. However, ambient wind and varying seal pressure around eyeglasses can degrade efficacy. Dual-topology hybrid systems combine feedforward with feedback microphones placed inside the acoustic cavity to measure what the listener actually hears, continuously fine-tuning cancellation in microsecond intervals.`,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80',
    category: 'Technology',
    author: 'Engineering Desk',
    tags: 'Tech, Noise-Cancellation, Audio-Tech, Innovation',
    read_time: '5 min read',
    is_published: 1
  },
  {
    id: 'b4-smart-living-2026',
    title: 'Smart Living in 2026: Seamless Ambient Intelligence',
    slug: 'smart-living-in-2026-seamless-ambient-intelligence',
    excerpt: 'How next-generation connected devices, spatial audio zones, and low-latency wireless protocols redefine the contemporary residence.',
    content: `The modern residence is shifting from reactive smart gadgets to proactive ambient intelligence. In 2026, home automation blends into the background, responding fluidly to presence, circadian rhythm, and individual preference without requiring manual app intervention.

### Spatial Audio Zones Across Rooms
Gone are the days of manually pairing Bluetooth speakers. Ultra-Wideband (UWB) tracking allows high-resolution audio streams to follow you gracefully from your study to the kitchen, transitioning with seamless room-calibrated equalizers.

### Effortless Energy Optimization
Intelligent thermal sensors and automated solar louvers work alongside smart HVAC controllers to slash power consumption while maintaining bespoke microclimate comfort throughout Dubai’s hottest summers. Luxury and environmental stewardship now exist in effortless harmony.`,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&auto=format&fit=crop&q=80',
    category: 'Smart Home',
    author: 'Vanta Dubai Editorial',
    tags: 'SmartHome, IoT, AudioZones, Connectivity, Future',
    read_time: '5 min read',
    is_published: 1
  }
];

/**
 * Initialize Database Tables & Seed Defaults
 */
export async function initDatabase() {
  if (isMysql) {
    console.log(`[Database] Connected to MySQL (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306} / ${process.env.DB_NAME || 'aerostore_db'})`);
    
    // Ensure blogs table exists in MySQL
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        image VARCHAR(500),
        category VARCHAR(100) DEFAULT 'Lifestyle',
        author VARCHAR(100) DEFAULT 'Vanta Dubai Editorial',
        tags VARCHAR(255) DEFAULT '',
        read_time VARCHAR(50) DEFAULT '5 min read',
        is_published TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure reviews table exists in MySQL
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        user_id INT NULL,
        customer_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) DEFAULT 'Dubai, UAE',
        rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
        comment TEXT NOT NULL,
        is_verified TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure color_images column exists on products table
    try {
      await mysqlPool.query('ALTER TABLE products ADD COLUMN color_images LONGTEXT NULL');
    } catch (_) {}

    // Seed default blogs if table is empty
    const [bRows] = await mysqlPool.query('SELECT COUNT(*) as count FROM blogs');
    if (bRows[0].count === 0) {
      for (const blog of DEFAULT_BLOGS) {
        await mysqlPool.query(`
          INSERT INTO blogs (id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [blog.id, blog.title, blog.slug, blog.excerpt, blog.content, blog.image, blog.category, blog.author, blog.tags, blog.read_time, blog.is_published]);
      }
      console.log(`[Database] Seeded ${DEFAULT_BLOGS.length} default blogs in MySQL`);
    }

    return;
  }

  // SQLite Initialization
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    sqliteDb.exec(schemaSql);
  }

  // Seed default blogs in SQLite if empty
  try {
    const blogCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM blogs').get();
    if (blogCount && blogCount.count === 0) {
      const insertBlog = sqliteDb.prepare(`
        INSERT INTO blogs (id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const blog of DEFAULT_BLOGS) {
        insertBlog.run(blog.id, blog.title, blog.slug, blog.excerpt, blog.content, blog.image, blog.category, blog.author, blog.tags, blog.read_time, blog.is_published);
      }
      console.log(`[Database] Seeded ${DEFAULT_BLOGS.length} default blogs in SQLite`);
    }
  } catch (_) {}

  const findUser = sqliteDb.prepare('SELECT id, email, role FROM users WHERE LOWER(email) = LOWER(?)');
  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com').toLowerCase();
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'password123';
  const superAdminName = process.env.SUPERADMIN_NAME || 'Super Administrator';
  const existingSuper = findUser.get(superAdminEmail);

  if (!existingSuper) {
    sqliteDb.prepare(`
      INSERT INTO users (name, email, password, role, phone, avatar)
      VALUES (?, ?, ?, 'superadmin', ?, ?)
    `).run(
      superAdminName,
      superAdminEmail,
      superAdminPassword,
      '+971 50 123 4567',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    );
  } else if (existingSuper.role !== 'superadmin') {
    sqliteDb.prepare('UPDATE users SET role = ? WHERE id = ?').run('superadmin', existingSuper.id);
  }
}

/**
 * User Queries
 */
export async function getUserByEmail(email) {
  if (!email) return null;
  if (isMysql) {
    const [rows] = await mysqlPool.query(
      'SELECT id, name, email, password, role, phone, avatar, refresh_token, created_at FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    return rows[0] || null;
  }
  try {
    return sqliteDb.prepare('SELECT id, name, email, password, role, phone, avatar, refresh_token, created_at FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
  } catch (_) {
    return sqliteDb.prepare('SELECT id, name, email, password, role, phone, avatar, created_at FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
  }
}

export async function getUserById(id) {
  if (!id) return null;
  if (isMysql) {
    const [rows] = await mysqlPool.query(
      'SELECT id, name, email, password, role, phone, avatar, refresh_token, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }
  try {
    return sqliteDb.prepare('SELECT id, name, email, password, role, phone, avatar, refresh_token, created_at FROM users WHERE id = ?').get(id) || null;
  } catch (_) {
    return sqliteDb.prepare('SELECT id, name, email, password, role, phone, avatar, created_at FROM users WHERE id = ?').get(id) || null;
  }
}

export async function saveUserRefreshToken(userId, token) {
  if (isMysql) {
    await mysqlPool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [token, userId]);
    return true;
  }
  try {
    sqliteDb.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(token, userId);
  } catch (_) {}
  return true;
}

export async function updateUserPassword(userId, passwordHash) {
  if (isMysql) {
    await mysqlPool.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, userId]);
    return true;
  }
  sqliteDb.prepare('UPDATE users SET password = ? WHERE id = ?').run(passwordHash, userId);
  return true;
}

export async function clearUserRefreshToken(userId) {
  if (isMysql) {
    await mysqlPool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);
    return true;
  }
  try {
    sqliteDb.prepare('UPDATE users SET refresh_token = NULL WHERE id = ?').run(userId);
  } catch (_) {}
  return true;
}

export async function createUser({ name, email, password, role = 'customer', phone = '', avatar = '' }) {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('User already exists with this email address.');
  }

  if (isMysql) {
    const [res] = await mysqlPool.query(
      'INSERT INTO users (name, email, password, role, phone, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role, phone, avatar]
    );
    return {
      id: Number(res.insertId),
      name,
      email,
      role,
      phone,
      avatar
    };
  }

  const result = sqliteDb.prepare(`
    INSERT INTO users (name, email, password, role, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, email, password, role, phone, avatar);

  return {
    id: Number(result.lastInsertRowid),
    name,
    email,
    role,
    phone,
    avatar
  };
}

export async function getAllUsers() {
  if (isMysql) {
    const [rows] = await mysqlPool.query('SELECT id, name, email, role, phone, avatar, created_at FROM users ORDER BY id ASC');
    return rows;
  }
  return sqliteDb.prepare('SELECT id, name, email, role, phone, avatar, created_at FROM users ORDER BY id ASC').all();
}

export async function updateUserRole(userId, newRole) {
  if (isMysql) {
    await mysqlPool.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);
    const [rows] = await mysqlPool.query('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?', [userId]);
    return rows[0];
  }
  sqliteDb.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);
  return sqliteDb.prepare('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?').get(userId);
}

export async function deleteUserInDb(userId) {
  if (isMysql) {
    await mysqlPool.query('DELETE FROM users WHERE id = ?', [userId]);
    return true;
  }
  sqliteDb.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return true;
}

/**
 * Product Queries
 */
export async function getAllProducts() {
  let rows;
  if (isMysql) {
    const [res] = await mysqlPool.query('SELECT * FROM products ORDER BY created_at DESC, id DESC');
    rows = res;
  } else {
    rows = sqliteDb.prepare('SELECT * FROM products ORDER BY created_at DESC, id DESC').all();
  }
  return rows.map((r) => ({
    id: String(r.id),
    sku: r.sku || `VNT-${(r.category || 'GEN').toUpperCase().slice(0, 4)}-${String(r.id).slice(0, 4)}`,
    name: r.name,
    brand: r.brand,
    category: r.category,
    price: Number(r.price),
    discountPrice: r.discount_price !== null ? Number(r.discount_price) : null,
    stock: Number(r.stock ?? 10),
    colors: (() => {
      if (!r.colors) return [];
      try {
        const parsed = JSON.parse(r.colors);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
      return String(r.colors).split(',').map((c) => c.trim()).filter(Boolean);
    })(),
    colorImages: (() => {
      if (!r.color_images) return {};
      try {
        const parsed = JSON.parse(r.color_images);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      } catch (_) {}
      return {};
    })(),
    images: (() => {
      if (!r.image) return [];
      try {
        const parsed = JSON.parse(r.image);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
      if (typeof r.image === 'string' && r.image.includes('|')) {
        return r.image.split('|').map(s => s.trim()).filter(Boolean);
      }
      return [r.image.trim()];
    })(),
    image: (() => {
      if (!r.image) return '';
      try {
        const parsed = JSON.parse(r.image);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (_) {}
      if (typeof r.image === 'string' && r.image.includes('|')) {
        return r.image.split('|')[0].trim();
      }
      return r.image.trim();
    })(),
    altText: r.alt_text,
    description: r.description,
    isFeatured: !!r.is_featured,
    isBestSeller: !!r.is_bestseller,
    isNewArrival: !!r.is_new,
    createdAt: r.created_at
  }));
}

export async function createProduct(prod) {
  const id = prod.id || crypto.randomUUID();
  const catCode = (prod.category || 'GEN').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'GEN';
  const sku = (prod.sku && prod.sku.trim())
    ? prod.sku.trim().toUpperCase()
    : `VNT-${catCode}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isFeatured = prod.isFeatured ? 1 : 0;
  const isBestSeller = prod.isBestSeller ? 1 : 0;
  const isNewArrival = typeof prod.isNewArrival === 'boolean' ? (prod.isNewArrival ? 1 : 0) : 1;
  const price = Number(prod.price || 0);
  const discountPrice = prod.discountPrice ? Number(prod.discountPrice) : null;
  const stock = prod.stock !== undefined ? Number(prod.stock) : 10;
  const colorsStr = prod.colors ? (Array.isArray(prod.colors) ? JSON.stringify(prod.colors) : String(prod.colors)) : '[]';
  const colorImagesStr = prod.colorImages ? (typeof prod.colorImages === 'string' ? prod.colorImages : JSON.stringify(prod.colorImages)) : '{}';
  const image = prod.images && Array.isArray(prod.images) && prod.images.length > 0
    ? (prod.images.length === 1 ? prod.images[0] : JSON.stringify(prod.images))
    : (prod.image || '');
  const altText = prod.altText || prod.name;
  const description = prod.description || '';

  if (isMysql) {
    await mysqlPool.query(`
      INSERT INTO products (id, sku, name, brand, category, price, discount_price, stock, colors, color_images, image, alt_text, description, is_featured, is_bestseller, is_new)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      sku,
      prod.name,
      prod.brand || 'VANTA DUBAI',
      prod.category || 'electronics',
      price,
      discountPrice,
      stock,
      colorsStr,
      colorImagesStr,
      image,
      altText,
      description,
      isFeatured,
      isBestSeller,
      isNewArrival
    ]);
    return { id, sku, ...prod, colors: Array.isArray(prod.colors) ? prod.colors : [], colorImages: prod.colorImages || {} };
  }

  const stmt = sqliteDb.prepare(`
    INSERT INTO products (id, sku, name, brand, category, price, discount_price, stock, image, alt_text, description, is_featured, is_bestseller, is_new)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    sku,
    prod.name,
    prod.brand || 'VANTA DUBAI',
    prod.category || 'electronics',
    price,
    discountPrice,
    stock,
    image,
    altText,
    description,
    isFeatured,
    isBestSeller,
    isNewArrival
  );
  return { id, sku, ...prod };
}

export async function updateProductInDb(id, prod) {
  const colorsStr = prod.colors !== undefined
    ? (Array.isArray(prod.colors) ? JSON.stringify(prod.colors) : String(prod.colors))
    : null;
  const colorImagesStr = prod.colorImages !== undefined
    ? (typeof prod.colorImages === 'string' ? prod.colorImages : JSON.stringify(prod.colorImages || {}))
    : null;

  if (isMysql) {
    await mysqlPool.query(`
      UPDATE products SET
        sku = COALESCE(?, sku),
        name = COALESCE(?, name),
        brand = COALESCE(?, brand),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        discount_price = COALESCE(?, discount_price),
        stock = COALESCE(?, stock),
        colors = COALESCE(?, colors),
        color_images = COALESCE(?, color_images),
        image = COALESCE(?, image),
        alt_text = COALESCE(?, alt_text),
        description = COALESCE(?, description),
        is_featured = COALESCE(?, is_featured),
        is_bestseller = COALESCE(?, is_bestseller),
        is_new = COALESCE(?, is_new)
      WHERE id = ?
    `, [
      prod.sku ? prod.sku.trim().toUpperCase() : null,
      prod.name || null,
      prod.brand || null,
      prod.category || null,
      prod.price !== undefined ? Number(prod.price) : null,
      prod.discountPrice !== undefined ? Number(prod.discountPrice) : null,
      prod.stock !== undefined ? Number(prod.stock) : null,
      colorsStr,
      colorImagesStr,
      prod.images && Array.isArray(prod.images) && prod.images.length > 0
        ? (prod.images.length === 1 ? prod.images[0] : JSON.stringify(prod.images))
        : (prod.image !== undefined ? (prod.image || '') : null),
      prod.altText || null,
      prod.description !== undefined ? prod.description : null,
      prod.isFeatured !== undefined ? (prod.isFeatured ? 1 : 0) : null,
      prod.isBestSeller !== undefined ? (prod.isBestSeller ? 1 : 0) : null,
      prod.isNewArrival !== undefined ? (prod.isNewArrival ? 1 : 0) : null,
      String(id)
    ]);
    const products = await getAllProducts();
    return products.find((p) => String(p.id) === String(id));
  }

  sqliteDb.prepare(`
    UPDATE products SET
      sku = coalesce(?, sku),
      name = coalesce(?, name),
      brand = coalesce(?, brand),
      category = coalesce(?, category),
      price = coalesce(?, price),
      discount_price = coalesce(?, discount_price),
      stock = coalesce(?, stock),
      image = coalesce(?, image),
      alt_text = coalesce(?, alt_text),
      description = coalesce(?, description),
      is_featured = coalesce(?, is_featured),
      is_bestseller = coalesce(?, is_bestseller),
      is_new = coalesce(?, is_new)
    WHERE id = ?
  `).run(
    prod.sku ? prod.sku.trim().toUpperCase() : null,
    prod.name,
    prod.brand,
    prod.category,
    prod.price !== undefined ? Number(prod.price) : null,
    prod.discountPrice !== undefined ? Number(prod.discountPrice) : null,
    prod.stock !== undefined ? Number(prod.stock) : null,
    prod.image !== undefined ? (prod.image || '') : (prod.images && prod.images[0]),
    prod.altText,
    prod.description,
    prod.isFeatured !== undefined ? (prod.isFeatured ? 1 : 0) : null,
    prod.isBestSeller !== undefined ? (prod.isBestSeller ? 1 : 0) : null,
    prod.isNewArrival !== undefined ? (prod.isNewArrival ? 1 : 0) : null,
    String(id)
  );
  const products = await getAllProducts();
  return products.find((p) => String(p.id) === String(id));
}

export async function deleteProductInDb(id) {
  if (isMysql) {
    await mysqlPool.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }
  sqliteDb.prepare('DELETE FROM products WHERE id = ?').run(id);
  return true;
}

export async function clearAllProductsInDb() {
  if (isMysql && mysqlPool) {
    try {
      await mysqlPool.query('DELETE FROM products');
    } catch (err) {
      console.error('[Database] MySQL clear products error:', err.message);
    }
  }
  if (sqliteDb) {
    try {
      sqliteDb.prepare('DELETE FROM products').run();
    } catch (_) {}
  }
  return true;
}

/**
 * Order Queries
 */
export async function getAllOrders() {
  let rows;
  if (isMysql) {
    const [res] = await mysqlPool.query('SELECT * FROM orders ORDER BY created_at DESC');
    rows = res;
  } else {
    rows = sqliteDb.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  }
  return rows.map((r) => {
    let items = [];
    try {
      items = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []);
    } catch (_) {
      items = [];
    }

    let shippingDetails = {
      fullName: r.customer_name || 'Valued Customer',
      street: r.shipping_address || 'Dubai, UAE',
      city: 'Dubai',
      state: 'Dubai',
      zip: '00000',
      country: 'United Arab Emirates',
      email: r.customer_email || '',
      phone: r.customer_phone || ''
    };
    try {
      if (r.shipping_address && typeof r.shipping_address === 'string' && r.shipping_address.trim().startsWith('{')) {
        const parsed = JSON.parse(r.shipping_address);
        shippingDetails = { ...shippingDetails, ...parsed };
      }
    } catch (_) {}

    return {
      orderId: r.id,
      userId: r.user_id,
      customerName: r.customer_name || shippingDetails.fullName,
      customerEmail: r.customer_email || shippingDetails.email,
      customerPhone: r.customer_phone || shippingDetails.phone,
      shippingAddress: r.shipping_address,
      shippingDetails,
      items,
      totals: {
        total: Number(r.total_amount || 0),
        subtotal: Number(r.total_amount || 0),
        shipping: 0,
        discount: 0,
        tax: 0
      },
      currency: r.currency || 'AED',
      paymentMethod: {
        method: r.payment_method || 'Cash on Delivery',
        status: r.payment_status || 'Pending'
      },
      status: r.order_status || 'Processing',
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today'
    };
  });
}

export async function getOrderById(orderId) {
  if (!orderId) return null;
  const cleanId = String(orderId).trim();
  const formattedId = cleanId.toUpperCase().startsWith('ORD-') ? cleanId.toUpperCase() : `ORD-${cleanId.toUpperCase()}`;
  let row = null;
  if (isMysql) {
    const [res] = await mysqlPool.query(
      'SELECT * FROM orders WHERE UPPER(id) = ? OR UPPER(id) = ? OR id LIKE ? LIMIT 1',
      [cleanId.toUpperCase(), formattedId, `%${cleanId}%`]
    );
    row = res[0] || null;
  } else {
    row = sqliteDb.prepare(
      'SELECT * FROM orders WHERE UPPER(id) = ? OR UPPER(id) = ? OR id LIKE ? LIMIT 1'
    ).get(cleanId.toUpperCase(), formattedId, `%${cleanId}%`) || null;
  }
  if (!row) return null;

  let items = [];
  try {
    items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
  } catch (_) {
    items = [];
  }

  let shippingDetails = {
    fullName: row.customer_name || 'Valued Customer',
    street: row.shipping_address || 'Dubai, UAE',
    city: 'Dubai',
    state: 'Dubai',
    zip: '00000',
    country: 'United Arab Emirates',
    email: row.customer_email || '',
    phone: row.customer_phone || ''
  };
  try {
    if (row.shipping_address && typeof row.shipping_address === 'string' && row.shipping_address.trim().startsWith('{')) {
      const parsed = JSON.parse(row.shipping_address);
      shippingDetails = { ...shippingDetails, ...parsed };
    }
  } catch (_) {}

  return {
    orderId: row.id,
    userId: row.user_id,
    customerName: row.customer_name || shippingDetails.fullName,
    customerEmail: row.customer_email || shippingDetails.email,
    customerPhone: row.customer_phone || shippingDetails.phone,
    shippingAddress: row.shipping_address,
    shippingDetails,
    items,
    totals: {
      total: Number(row.total_amount || 0),
      subtotal: Number(row.total_amount || 0),
      shipping: 0,
      discount: 0,
      tax: 0
    },
    totalAmount: Number(row.total_amount || 0),
    currency: row.currency || 'AED',
    paymentMethod: {
      method: row.payment_method || 'Cash on Delivery',
      status: row.payment_status || 'Pending'
    },
    status: row.order_status || 'Processing',
    date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today'
  };
}

export async function createOrderInDb({
  id,
  userId = null,
  customerName,
  customerEmail,
  customerPhone = '',
  shippingAddress = '',
  items = [],
  totalAmount,
  currency = 'AED',
  paymentMethod = 'Cash on Delivery',
  paymentStatus = 'Pending',
  orderStatus = 'Processing'
}) {
  const orderId = id || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);

  if (isMysql) {
    await mysqlPool.query(`
      INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, currency, payment_method, payment_status, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      itemsJson,
      Number(totalAmount || 0),
      currency,
      paymentMethod,
      paymentStatus,
      orderStatus
    ]);
    return { orderId, success: true };
  }

  sqliteDb.prepare(`
    INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, currency, payment_method, payment_status, order_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    itemsJson,
    Number(totalAmount || 0),
    currency,
    paymentMethod,
    paymentStatus,
    orderStatus
  );

  return { orderId, success: true };
}

export async function updateOrderStatusInDb(orderId, newStatus) {
  if (isMysql) {
    await mysqlPool.query('UPDATE orders SET order_status = ? WHERE id = ?', [newStatus, orderId]);
    return true;
  }
  sqliteDb.prepare('UPDATE orders SET order_status = ? WHERE id = ?').run(newStatus, orderId);
  return true;
}

/**
 * Settings Queries
 */
export async function getAllSettings() {
  let rows;
  if (isMysql) {
    const [res] = await mysqlPool.query('SELECT `key`, `value` FROM settings');
    rows = res;
  } else {
    rows = sqliteDb.prepare('SELECT key, value FROM settings').all();
  }
  const settingsObj = {};
  for (const row of rows) {
    try {
      settingsObj[row.key] = JSON.parse(row.value);
    } catch (_) {
      settingsObj[row.key] = row.value;
    }
  }
  return settingsObj;
}

export async function updateSettings(updates) {
  for (const [k, v] of Object.entries(updates)) {
    const valStr = typeof v === 'string' ? v : JSON.stringify(v);
    if (isMysql) {
      await mysqlPool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        [k, valStr]
      );
    } else {
      sqliteDb.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(k, valStr);
    }
  }
  return getAllSettings();
}

export async function deleteSettingKey(key) {
  if (isMysql) {
    await mysqlPool.query('DELETE FROM settings WHERE `key` = ?', [key]);
    return getAllSettings();
  }
  sqliteDb.prepare('DELETE FROM settings WHERE key = ?').run(key);
  return getAllSettings();
}

/**
 * Category Queries
 */
export async function getAllCategories() {
  if (isMysql) {
    const [rows] = await mysqlPool.query(`
      SELECT c.id, c.name, c.icon, c.image,
             COALESCE(p.cnt, 0) AS count,
             c.description, c.created_at
      FROM categories c
      LEFT JOIN (
        SELECT LOWER(category) AS cat_id, COUNT(*) AS cnt
        FROM products
        GROUP BY LOWER(category)
      ) p ON LOWER(c.id) = p.cat_id
      WHERE c.id NOT IN ('groceries', 'sneakers', 'gaming-vr')
      ORDER BY c.name ASC
    `);
    return rows.map((r) => ({ ...r, count: Number(r.count || 0) }));
  }
  return sqliteDb.prepare("SELECT id, name, icon, image, count, description, created_at FROM categories WHERE id NOT IN ('groceries', 'sneakers', 'gaming-vr') ORDER BY name ASC").all();
}

export async function createCategoryInDb({ id, name, icon = 'RiShoppingBagLine', image = '', description = '', count = 0 }) {
  const catId = id || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  if (isMysql) {
    await mysqlPool.query(`
      INSERT INTO categories (id, name, icon, image, count, description)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), image = VALUES(image), description = VALUES(description)
    `, [catId, name, icon, image, count, description]);
    return { id: catId, name, icon, image, count, description };
  }

  sqliteDb.prepare(`
    INSERT INTO categories (id, name, icon, image, count, description)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, icon = excluded.icon, image = excluded.image, description = excluded.description
  `).run(catId, name, icon, image, count, description);
  return { id: catId, name, icon, image, count, description };
}

export async function deleteCategoryInDb(id) {
  if (isMysql) {
    await mysqlPool.query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }
  sqliteDb.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return true;
}

/**
 * Blog / Article Queries
 */
export async function getAllBlogs(includeDrafts = false) {
  const whereClause = includeDrafts ? '' : 'WHERE is_published = 1';
  if (isMysql) {
    const [rows] = await mysqlPool.query(
      `SELECT id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published, created_at, updated_at 
       FROM blogs ${whereClause} 
       ORDER BY created_at DESC`
    );
    return rows;
  }
  return sqliteDb.prepare(
    `SELECT id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published, created_at, updated_at 
     FROM blogs ${whereClause} 
     ORDER BY created_at DESC`
  ).all();
}

export async function getBlogByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  if (isMysql) {
    const [rows] = await mysqlPool.query(
      `SELECT id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published, created_at, updated_at 
       FROM blogs 
       WHERE id = ? OR slug = ? 
       LIMIT 1`,
      [idOrSlug, idOrSlug]
    );
    return rows[0] || null;
  }
  return sqliteDb.prepare(
    `SELECT id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published, created_at, updated_at 
     FROM blogs 
     WHERE id = ? OR slug = ? 
     LIMIT 1`
  ).get(idOrSlug, idOrSlug) || null;
}

export async function createBlog({
  id,
  title,
  slug,
  excerpt = '',
  content = '',
  image = '',
  category = 'Lifestyle',
  author = 'Vanta Dubai Editorial',
  tags = '',
  read_time = '5 min read',
  is_published = 1
}) {
  const blogId = id || crypto.randomUUID();
  const cleanSlug = (slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || 'article-' + Date.now();
  const pubVal = is_published ? 1 : 0;

  if (isMysql) {
    await mysqlPool.query(
      `INSERT INTO blogs (id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [blogId, title, cleanSlug, excerpt, content, image, category, author, tags, read_time, pubVal]
    );
    return getBlogByIdOrSlug(blogId);
  }

  sqliteDb.prepare(
    `INSERT INTO blogs (id, title, slug, excerpt, content, image, category, author, tags, read_time, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(blogId, title, cleanSlug, excerpt, content, image, category, author, tags, read_time, pubVal);
  return getBlogByIdOrSlug(blogId);
}

export async function updateBlog(id, {
  title,
  slug,
  excerpt,
  content,
  image,
  category,
  author,
  tags,
  read_time,
  is_published
}) {
  const existing = await getBlogByIdOrSlug(id);
  if (!existing) return null;

  const newTitle = title !== undefined ? title : existing.title;
  const newSlug = slug !== undefined ? slug : existing.slug;
  const newExcerpt = excerpt !== undefined ? excerpt : existing.excerpt;
  const newContent = content !== undefined ? content : existing.content;
  const newImage = image !== undefined ? image : existing.image;
  const newCategory = category !== undefined ? category : existing.category;
  const newAuthor = author !== undefined ? author : existing.author;
  const newTags = tags !== undefined ? tags : existing.tags;
  const newReadTime = read_time !== undefined ? read_time : existing.read_time;
  const newPublished = is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published;

  if (isMysql) {
    await mysqlPool.query(
      `UPDATE blogs 
       SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, category = ?, author = ?, tags = ?, read_time = ?, is_published = ?
       WHERE id = ?`,
      [newTitle, newSlug, newExcerpt, newContent, newImage, newCategory, newAuthor, newTags, newReadTime, newPublished, id]
    );
    return getBlogByIdOrSlug(id);
  }

  sqliteDb.prepare(
    `UPDATE blogs 
     SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, category = ?, author = ?, tags = ?, read_time = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(newTitle, newSlug, newExcerpt, newContent, newImage, newCategory, newAuthor, newTags, newReadTime, newPublished, id);
  return getBlogByIdOrSlug(id);
}

export async function deleteBlog(id) {
  if (isMysql) {
    await mysqlPool.query('DELETE FROM blogs WHERE id = ?', [id]);
    return true;
  }
  sqliteDb.prepare('DELETE FROM blogs WHERE id = ?').run(id);
  return true;
}

export async function getReviewsByProductId(productId) {
  if (isMysql) {
    const [rows] = await mysqlPool.query(
      'SELECT id, customer_name AS name, location, rating, comment, is_verified AS verified, DATE_FORMAT(created_at, "%Y-%m-%d") AS date FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
    return rows.map((r) => ({ ...r, rating: Number(r.rating), verified: Boolean(r.verified) }));
  }
  return [];
}

export async function addReviewToDb({ productId, name, location, rating, comment }) {
  if (isMysql) {
    const [result] = await mysqlPool.query(
      'INSERT INTO reviews (product_id, customer_name, location, rating, comment, is_verified, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())',
      [productId, name, location || 'Dubai, UAE', Number(rating) || 5.0, comment]
    );
    return {
      id: result.insertId,
      name,
      location: location || 'Dubai, UAE',
      rating: Number(rating) || 5.0,
      comment,
      verified: true,
      date: new Date().toISOString().split('T')[0]
    };
  }
  return null;
}

