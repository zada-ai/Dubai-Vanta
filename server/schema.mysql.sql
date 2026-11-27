-- ========================================================
-- AEROSTORE / DUBAI VANTA - MYSQL DATABASE SCHEMA
-- 5 Clean, lightweight, normalized tables
-- Compatible with XAMPP MySQL / MariaDB 10.4+
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  phone VARCHAR(50),
  avatar TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PRODUCTS TABLE (UUID v4 Primary Key + Unique SKU Based)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  brand VARCHAR(100),
  category VARCHAR(100) DEFAULT 'electronics',
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  stock INT DEFAULT 10,
  image TEXT,
  alt_text VARCHAR(255),
  description TEXT,
  is_featured TINYINT(1) DEFAULT 0,
  is_bestseller TINYINT(1) DEFAULT 0,
  is_new TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ORDERS TABLE (Cash on Delivery Ready)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  user_id INT,
  customer_name VARCHAR(255),
  customer_email VARCHAR(191),
  customer_phone VARCHAR(50),
  shipping_address TEXT,
  items LONGTEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AED',
  payment_method VARCHAR(100) DEFAULT 'Cash on Delivery',
  payment_status VARCHAR(100) DEFAULT 'Pending',
  order_status VARCHAR(100) DEFAULT 'Processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SETTINGS TABLE (Store config, hero slides, logo, SEO, promo banner)
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(191) PRIMARY KEY,
  `value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CATEGORIES TABLE (Dynamic Store Categories)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100) DEFAULT 'RiShoppingBagLine',
  image TEXT,
  count INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BLOGS TABLE (Articles & Editorial Posts)
CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT,
  image VARCHAR(500),
  category VARCHAR(100) DEFAULT 'Lifestyle',
  author VARCHAR(100) DEFAULT 'AeroStore Editorial',
  tags VARCHAR(255) DEFAULT '',
  read_time VARCHAR(50) DEFAULT '5 min read',
  is_published TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REVIEWS TABLE (Customer Reviews & Ratings)
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


