import { DatabaseSync } from 'node:sqlite';
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
export const sqliteDb = new DatabaseSync(dbPath);
export const db = sqliteDb; // backwards compatibility

/**
 * Initialize Database Tables & Seed Defaults
 */
export async function initDatabase() {
  if (isMysql) {
    console.log(`[Database] Connected to MySQL (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306} / ${process.env.DB_NAME || 'aerostore_db'})`);
    return;
  }

  // SQLite Initialization
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    sqliteDb.exec(schemaSql);
  }

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
    stock: r.stock,
    images: (r.image && r.image.trim()) ? [r.image.trim()] : [],
    image: r.image || '',
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
  const image = prod.image || (prod.images && prod.images[0]) || '';
  const altText = prod.altText || prod.name;
  const description = prod.description || '';

  if (isMysql) {
    await mysqlPool.query(`
      INSERT INTO products (id, sku, name, brand, category, price, discount_price, stock, image, alt_text, description, is_featured, is_bestseller, is_new)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
    ]);
    return { id, sku, ...prod };
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
      prod.image !== undefined ? (prod.image || '') : (prod.images && prod.images[0]) || null,
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
      items = JSON.parse(r.items);
    } catch (_) {}

    return {
      orderId: r.id,
      userId: r.user_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      shippingAddress: r.shipping_address,
      items,
      totals: {
        total: Number(r.total_amount),
        subtotal: Number(r.total_amount),
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
    const [rows] = await mysqlPool.query('SELECT id, name, icon, image, count, description, created_at FROM categories ORDER BY name ASC');
    return rows;
  }
  return sqliteDb.prepare('SELECT id, name, icon, image, count, description, created_at FROM categories ORDER BY name ASC').all();
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
