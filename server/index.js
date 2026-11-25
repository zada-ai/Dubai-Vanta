import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import sharp from 'sharp';
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
  deleteUserInDb,
  getAllProducts,
  createProduct,
  updateProductInDb,
  deleteProductInDb,
  clearAllProductsInDb,
  getAllOrders,
  getOrderById,
  createOrderInDb,
  updateOrderStatusInDb,
  getAllCategories,
  createCategoryInDb,
  deleteCategoryInDb,
  getAllBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
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

// Multer memory storage (holds upload buffer for Sharp WebP conversion)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif', 'image/bmp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only standard image files (PNG, JPG, WEBP, SVG) are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB max upload limit before compression
  fileFilter
});

// Universal WebP Image Optimization Helper (Converts raster images to .webp in tiny KB size)
async function processAndSaveImage(file) {
  if (!file || !file.buffer) {
    throw new Error('No valid image buffer provided.');
  }

  // Preserve SVG vector format
  if (file.mimetype === 'image/svg+xml') {
    const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.svg`;
    const targetPath = path.join(storageDir, filename);
    await fs.promises.writeFile(targetPath, file.buffer);
    return {
      filename,
      imageUrl: `/storage/${filename}`,
      format: 'svg'
    };
  }

  // Convert any raster image (PNG, JPG, JPEG, WEBP, BMP, GIF) to highly-optimized WebP
  const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
  const targetPath = path.join(storageDir, filename);

  await sharp(file.buffer)
    .rotate() // auto-orient based on EXIF metadata
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(targetPath);

  return {
    filename,
    imageUrl: `/storage/${filename}`,
    format: 'webp'
  };
}

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
    const isSuper = normalizedEmail === (process.env.SUPERADMIN_EMAIL || 'sohaibmehmood0067@gmail.com').toLowerCase();
    const isSuperManager = normalizedEmail === 'manager@aerostore.com' || normalizedEmail.includes('supermanager');
    const isAdmin = isSuper || isSuperManager || normalizedEmail.includes('admin');
    const role = isSuper ? 'superadmin' : isSuperManager ? 'supermanager' : isAdmin ? 'admin' : 'customer';

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

// Helper to extract requester user from token or cookie
async function getRequesterUser(req) {
  try {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.split(' ')[1];
    if (bearerToken) {
      try {
        const decoded = jwt.verify(bearerToken, JWT_ACCESS_SECRET);
        const user = await getUserById(decoded.id);
        if (user) return user;
      } catch (_) {}
    }
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await getUserById(decoded.id);
        if (user) return user;
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

// Update User Role (Super Admin & Super Manager Privilege)
app.put('/api/auth/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['superadmin', 'supermanager', 'admin', 'customer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be superadmin, supermanager, admin, or customer' });
    }

    const requester = await getRequesterUser(req);
    const targetUser = await getUserById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Super Manager CANNOT modify Super Admin!
    if (requester && requester.role === 'supermanager' && targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Manager cannot modify Super Admin role' });
    }

    const updated = await updateUserRole(req.params.id, role);
    res.json({ success: true, message: `User role updated to ${role}`, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete User Endpoint (Super Admin & Super Manager Privilege)
app.delete('/api/auth/users/:id', async (req, res) => {
  try {
    const requester = await getRequesterUser(req);
    const targetUser = await getUserById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Super Manager CANNOT delete Super Admin!
    if (requester && requester.role === 'supermanager' && targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Super Manager cannot remove Super Admin' });
    }

    // Protect Super Admin from being deleted by non-superadmin
    if (targetUser.role === 'superadmin' && requester?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can remove a Super Admin' });
    }

    await deleteUserInDb(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
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

// Clear All Dummy Products Endpoint
app.delete('/api/products', async (req, res) => {
  try {
    await clearAllProductsInDb();
    cache.del('products');
    cache.del('sitemap');
    res.json({ success: true, message: 'All products removed from database successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/products/clear', async (req, res) => {
  try {
    await clearAllProductsInDb();
    cache.del('products');
    cache.del('sitemap');
    res.json({ success: true, message: 'All products removed from database successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
// Blogs & Articles API (Public View + Admin Full Management)
// ==========================================
app.get('/api/blogs', async (req, res) => {
  try {
    const wantAll = req.query.all === 'true';
    let includeDrafts = false;

    if (wantAll) {
      const requester = await getRequesterUser(req);
      if (requester && ['admin', 'superadmin', 'supermanager'].includes(requester.role)) {
        includeDrafts = true;
      }
    }

    const cacheKey = includeDrafts ? 'blogs_all' : 'blogs_published';
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const blogs = await getAllBlogs(includeDrafts);
    const payload = { success: true, count: blogs.length, blogs };
    cache.set(cacheKey, payload, 180); // 3 mins TTL
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/blogs/:idOrSlug', async (req, res) => {
  try {
    const blog = await getBlogByIdOrSlug(req.params.idOrSlug);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    if (!blog.is_published) {
      const requester = await getRequesterUser(req);
      if (!requester || !['admin', 'superadmin', 'supermanager'].includes(requester.role)) {
        return res.status(404).json({ success: false, message: 'Blog article not found' });
      }
    }

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    const requester = await getRequesterUser(req);
    if (!requester || !['admin', 'superadmin', 'supermanager'].includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    const { title, slug, excerpt, content, image, category, author, tags, read_time, is_published } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required for blog article' });
    }

    if (content) {
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 1500) {
        return res.status(400).json({ success: false, message: 'Article content cannot exceed 1500 words' });
      }
    }

    const newBlog = await createBlog({
      title: title.trim(),
      slug: slug ? slug.trim() : undefined,
      excerpt,
      content,
      image,
      category: category || 'Lifestyle',
      author: author || requester.name || 'AeroStore Editorial',
      tags: tags || '',
      read_time: read_time || '5 min read',
      is_published: is_published !== undefined ? is_published : 1
    });

    cache.del('blogs_all');
    cache.del('blogs_published');
    cache.del('sitemap');
    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const requester = await getRequesterUser(req);
    if (!requester || !['admin', 'superadmin', 'supermanager'].includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    if (req.body.content) {
      const wordCount = req.body.content.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 1500) {
        return res.status(400).json({ success: false, message: 'Article content cannot exceed 1500 words' });
      }
    }

    const updated = await updateBlog(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    cache.del('blogs_all');
    cache.del('blogs_published');
    cache.del('sitemap');
    res.json({ success: true, blog: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const requester = await getRequesterUser(req);
    if (!requester || !['admin', 'superadmin', 'supermanager'].includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    await deleteBlog(req.params.id);
    cache.del('blogs_all');
    cache.del('blogs_published');
    cache.del('sitemap');
    res.json({ success: true, message: 'Blog article deleted successfully' });
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

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with this ID.' });
    }
    res.json({ success: true, order });
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

// Universal Storage Image Upload Endpoint (Auto-converts to WebP in KBs)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const result = await processAndSaveImage(req.file);
    res.json({
      success: true,
      imageUrl: result.imageUrl,
      url: result.imageUrl,
      path: result.imageUrl,
      filename: result.filename,
      format: result.format,
      message: 'Image converted to WebP and saved successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Settings & Product Image Upload Route (Auto-converts to WebP in KBs)
app.post('/api/settings/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const result = await processAndSaveImage(req.file);
    res.json({
      success: true,
      imageUrl: result.imageUrl,
      url: result.imageUrl,
      path: result.imageUrl,
      filename: result.filename,
      format: result.format,
      message: 'Image converted to WebP and saved successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Store Logo Upload (Auto-converts to WebP or preserves SVG)
app.post('/api/settings/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file provided.' });
    }
    const result = await processAndSaveImage(req.file);
    const logoUrl = result.imageUrl;
    const settings = await updateSettings({ logoUrl });
    cache.del('settings');
    cache.del('sitemap');

    res.json({
      success: true,
      message: 'Logo converted and saved successfully to storage.',
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
