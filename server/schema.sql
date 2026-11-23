-- ========================================================
-- AEROSTORE / DUBAI VANTA - DATABASE SCHEMA
-- Clean, lightweight, and normalized tables ("choty choty tables")
-- Compatible with SQLite, MySQL, and PostgreSQL
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer', -- 'superadmin', 'admin', 'customer'
  phone TEXT,
  avatar TEXT,
  refresh_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS TABLE (UUID Primary Key + SKU Based)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  brand TEXT,
  category TEXT DEFAULT 'electronics',
  price REAL NOT NULL,
  discount_price REAL,
  stock INTEGER DEFAULT 10,
  image TEXT,
  alt_text TEXT,
  description TEXT,
  is_featured INTEGER DEFAULT 0,
  is_bestseller INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  items TEXT,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'AED',
  payment_method TEXT DEFAULT 'Cash on Delivery',
  payment_status TEXT DEFAULT 'Pending',
  order_status TEXT DEFAULT 'Processing',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. SETTINGS TABLE (Store config, hero slides, logo, SEO)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. CATEGORIES TABLE (Dynamic Store Categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'RiShoppingBagLine',
  image TEXT,
  count INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. BLOGS TABLE (Articles & Editorial Posts)
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  category TEXT DEFAULT 'Lifestyle',
  author TEXT DEFAULT 'AeroStore Editorial',
  tags TEXT DEFAULT '',
  read_time TEXT DEFAULT '5 min read',
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
