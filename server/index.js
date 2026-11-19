import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  initDatabase, 
  getUserByEmail, 
  getUserById,
  saveUserRefreshToken,
  clearUserRefreshToken,
  createUser, 
  getAllUsers, 
  updateUserRole,
  getAllProducts,
  createProduct,
  updateProductInDb,
  deleteProductInDb,
  getAllOrders,
  createOrderInDb,
  updateOrderStatusInDb,
  getAllCategories,
  createCategoryInDb,
  deleteCategoryInDb,
  getAllSettings, 
  updateSettings, 
  deleteSettingKey 
} from './db.js';
import { registerSeoRoutes } from './seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safe .env loader
const envPaths = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '.env.local')
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    try {
      process.loadEnvFile(p);
      break;
    } catch (_) {
      try {
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
      } catch (__) {}
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// JWT & Cookie Config
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'aerostore_access_secret_key_2026_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'aerostore_refresh_secret_key_2026_super_secure';
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '24h';

function parseExpiryToMs(expiryStr) {
  if (!expiryStr) return 24 * 60 * 60 * 1000;
  const num = parseInt(expiryStr, 10);
  if (expiryStr.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  if (expiryStr.endsWith('h')) return num * 60 * 60 * 1000;
  if (expiryStr.endsWith('m')) return num * 60 * 1000;
  if (expiryStr.endsWith('s')) return num * 1000;
  return 24 * 60 * 60 * 1000;
}

const REFRESH_COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: parseExpiryToMs(REFRESH_TOKEN_EXPIRES_IN), // 24 hours (86,400,000 ms)
  path: '/'
};

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

function formatSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2026'
  };
}

// Directories & Storage Link (storage/uploads + public/storage link)
const storageDir = path.resolve(__dirname, '..', 'storage', 'uploads');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}
const publicStorageLink = path.resolve(__dirname, '..', 'public', 'storage');
try {
  if (!fs.existsSync(publicStorageLink)) {
    fs.symlinkSync(storageDir, publicStorageLink, 'junction');
  }
} catch (_) {}
const uploadsDir = storageDir;

// ==========================================
// In-Memory Cache Store with TTL & Invalidation
// ==========================================
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  set(key, value, ttlSeconds = 60) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
  del(key) {
    this.cache.delete(key);
  }
  delPrefix(prefix) {
    for (const k of this.cache.keys()) {
      if (k.startsWith(prefix)) this.cache.delete(k);
    }
  }
  clear() {
    this.cache.clear();
  }
}
const cache = new MemoryCache();

// ==========================================
// Rate Limiters (DDoS & Brute-Force Defense)
// ==========================================
// 1. General API limiter: 300 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: true,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// 2. Sensitive Auth limiter: 15 attempts per 15 minutes (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
  }
});

// 3. Order Placement limiter: 30 orders per 15 minutes (spam checkout defense)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: true,
  message: {
    success: false,
    message: 'Too many order requests. Please slow down.'
  }
});

// Initialize database tables & seed
await initDatabase();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.SITE_URL || 'http://localhost:5173'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Static file serving with browser Cache-Control (1 day immutable cache)
app.use('/storage', express.static(storageDir, {
  maxAge: '1d',
  immutable: true
}));
app.use('/uploads', express.static(storageDir, {
  maxAge: '1d',
  immutable: true
}));

// Apply general API rate limiter to all /api routes
app.use('/api', apiLimiter);

// Multer storage config for uploads (writes directly to storage/uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanName = `upload-${Date.now()}${ext}`;
    cb(null, cleanName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, WEBP, and SVG image files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter
});

// ==========================================
// 1. Health Check
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'AeroStore Backend',
    database: (process.env.DB_TYPE || 'sqlite').toLowerCase() === 'mysql' ? 'MySQL (XAMPP MariaDB)' : 'SQLite 3 (node:sqlite)',
    auth: 'JWT with httpOnly Refresh Token Cookies',
    rateLimiting: 'Active (apiLimiter: 300/15m, authLimiter: 15/15m, orderLimiter: 30/15m)',
    cache: 'In-Memory Cache (TTL & Invalidation) + Static 1d Cache-Control',
    time: new Date()
  });
});

// ==========================================
// 2. Authentication API (JWT + httpOnly Refresh Token)
// ==========================================
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Safe user payload
    const safeUser = formatSafeUser(user);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    await saveUserRefreshToken(user.id, refreshToken);

    // Set secure httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      accessToken,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isSuper = normalizedEmail === (process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com');
    const isAdmin = isSuper || normalizedEmail.includes('admin');
    const role = isSuper ? 'superadmin' : isAdmin ? 'admin' : 'customer';

    const newUser = await createUser({
      name,
      email: normalizedEmail,
      password,
      role,
      phone: phone || '',
      avatar: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
    });

    const safeUser = formatSafeUser(newUser);
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Save refresh token to database
    await saveUserRefreshToken(newUser.id, refreshToken);

    // Set secure httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Account registered successfully!',
      accessToken,
      user: safeUser
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Refresh Token Endpoint (Consumes httpOnly cookie)
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.headers['x-refresh-token'];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided in httpOnly cookie.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Verify token matches active database refresh token (revocation & reuse protection)
    if (!user.refresh_token || user.refresh_token !== token) {
      res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
      return res.status(403).json({ success: false, message: 'Refresh token revoked, expired, or already used.' });
    }

    // Issue new tokens (Token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save updated token to database
    await saveUserRefreshToken(user.id, newRefreshToken);

    // Set new httpOnly cookie
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: formatSafeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logout Endpoint (Clears httpOnly cookie and database token)
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        if (decoded?.id) {
          await clearUserRefreshToken(decoded.id);
        }
      } catch (_) {}
    }

    res.clearCookie(REFRESH_COOKIE_NAME, COOKIE_OPTIONS);
    res.json({ success: true, message: 'Logged out successfully, refresh token cookie cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Current User Me Endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    // 1. Try Bearer access token
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.split(' ')[1];

    if (bearerToken) {
      try {
        const decoded = jwt.verify(bearerToken, JWT_ACCESS_SECRET);
        const user = await getUserById(decoded.id);
        if (user) {
          return res.json({ success: true, user: formatSafeUser(user) });
        }
      } catch (_) {}
    }

    // 2. Fallback to httpOnly refresh token
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await getUserById(decoded.id);
        if (user && user.refresh_token === refreshToken) {
          return res.json({ success: true, user: formatSafeUser(user) });
        }
      } catch (_) {}
    }

    res.status(401).json({ success: false, message: 'Unauthenticated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update User Role (Super Admin Privilege)
app.put('/api/auth/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['superadmin', 'admin', 'customer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be superadmin, admin, or customer' });
    }
    const updated = await updateUserRole(req.params.id, role);
    res.json({ success: true, message: `User role updated to ${role}`, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// Products API (Lightweight Database Table with In-Memory Caching)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const cached = cache.get('products');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
      return res.json(cached);
    }
    const products = await getAllProducts();
    const payload = { success: true, count: products.length, products };
    cache.set('products', payload, 120); // 2 mins TTL
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProd = await createProduct(req.body);
    cache.del('products');
    cache.del('sitemap');
    res.status(201).json({ success: true, product: newProd });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await updateProductInDb(req.params.id, req.body);
    cache.del('products');
    cache.del('sitemap');
    res.json({ success: true, product: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await deleteProductInDb(req.params.id);
    cache.del('products');
    cache.del('sitemap');
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// Categories API (Dynamic Store Categories with In-Memory Caching)
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const cached = cache.get('categories');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=120');
      return res.json(cached);
    }
    const categories = await getAllCategories();
    const payload = { success: true, count: categories.length, categories };
    cache.set('categories', payload, 300); // 5 mins TTL
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=120');
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, id, icon, image, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const newCat = await createCategoryInDb({
      id,
      name: name.trim(),
      icon,
      image,
      description
    });
    cache.del('categories');
    cache.del('sitemap');
    res.status(201).json({ success: true, category: newCat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await deleteCategoryInDb(req.params.id);
    cache.del('categories');
    cache.del('sitemap');
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// Orders API (Lightweight Database Table with Cash on Delivery)
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Middleware: Verify Access Token (Returns 401 on expired token to trigger client silent refresh)
function authenticateOptionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // 401 Unauthorized triggers the frontend interceptor (authFetch) to silently hit /api/auth/refresh
      return res.status(401).json({
        success: false,
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: 'Access token expired or invalid. Please refresh token.'
      });
    }
  }

  // Optional for guest checkout
  next();
}

app.post('/api/orders', orderLimiter, authenticateOptionalToken, async (req, res) => {
  try {
    const {
      orderId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      currency,
      paymentMethod,
      paymentStatus,
      orderStatus,
      shippingDetails,
      totals
    } = req.body;

    const chosenPaymentMethod = typeof paymentMethod === 'string' 
      ? paymentMethod 
      : (paymentMethod?.method || 'Cash on Delivery');

    const effectiveUserId = req.user?.id || userId || null;

    const result = await createOrderInDb({
      id: orderId,
      userId: effectiveUserId,
      customerName: customerName || shippingDetails?.fullName || req.user?.name || 'Customer',
      customerEmail: customerEmail || shippingDetails?.email || req.user?.email || '',
      customerPhone: customerPhone || shippingDetails?.phone || '',
      shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingDetails || {}),
      items: items || [],
      totalAmount: totalAmount || totals?.total || 0,
      currency: currency || 'AED',
      paymentMethod: chosenPaymentMethod,
      paymentStatus: paymentStatus || (chosenPaymentMethod === 'Cash on Delivery' ? 'Pending (Pay upon arrival)' : 'Paid'),
      orderStatus: orderStatus || 'Processing'
    });

    res.status(201).json({
      success: true,
      order: {
        orderId: result.orderId,
        id: result.orderId,
        userId: effectiveUserId
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await updateOrderStatusInDb(req.params.id, status);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. Settings API (Store Configuration with In-Memory Caching)
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const cached = cache.get('settings');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
      return res.json(cached);
    }
    const settings = await getAllSettings();
    const payload = { success: true, settings };
    cache.set('settings', payload, 120);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    const settings = await updateSettings(updates);
    cache.del('settings');
    cache.del('sitemap');
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Universal Storage Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const imageUrl = `/storage/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl,
      url: imageUrl,
      path: imageUrl,
      filename: req.file.filename,
      message: 'Image uploaded to storage successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Settings & Product Image Upload Route (Saves to storage)
app.post('/api/settings/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const imageUrl = `/storage/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl,
      url: imageUrl,
      path: imageUrl,
      filename: req.file.filename,
      message: 'Image uploaded to storage successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Store Logo Upload (Saves to storage)
app.post('/api/settings/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file provided.' });
    }
    const logoUrl = `/storage/${req.file.filename}`;
    const settings = await updateSettings({ logoUrl });
    cache.del('settings');
    cache.del('sitemap');

    res.json({
      success: true,
      message: 'Logo uploaded and saved successfully to storage.',
      logoUrl,
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset Store Logo
app.delete('/api/settings/logo', async (req, res) => {
  try {
    const current = await getAllSettings();
    if (current.logoUrl) {
      const filename = path.basename(current.logoUrl);
      const filePath = path.join(storageDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    const updated = await updateSettings({ logoUrl: null });
    cache.del('settings');
    cache.del('sitemap');
    res.json({
      success: true,
      message: 'Logo reset to default.',
      settings: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. Dynamic SEO Routes: robots.txt & sitemap.xml
// ==========================================
registerSeoRoutes(app, { cache, getAllSettings, getAllProducts, getAllCategories });

// Update robots.txt
app.post('/api/settings/robots', async (req, res) => {
  try {
    const { robotsTxt } = req.body;
    if (typeof robotsTxt !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid robots.txt content' });
    }
    const current = await getAllSettings();
    const updatedSeo = { ...(current.seo || {}), robotsTxt };
    const settings = await updateSettings({ seo: updatedSeo });
    cache.del('settings');
    cache.del('sitemap');

    // Also update public/robots.txt file on disk
    try {
      const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
      fs.writeFileSync(robotsPath, robotsTxt, 'utf-8');
    } catch (_) {}

    res.json({ success: true, message: 'robots.txt updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. Production: serve the built React app (dist/) with SPA fallback
// ==========================================
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(400).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`[AeroStore SQLite Backend] Server running on http://localhost:${PORT}`);
});
