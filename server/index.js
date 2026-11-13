import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  initDatabase, 
  getUserByEmail, 
  createUser, 
  getAllUsers, 
  getAllSettings, 
  updateSettings, 
  deleteSettingKey 
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading .env or .env.local via Node 22/24 native loader
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
} catch (_) {}

const app = express();
const PORT = process.env.PORT || 5000;

// Directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize SQLite tables & seed
initDatabase();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer storage config for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
    server: 'AeroStore SQLite Backend',
    database: 'SQLite 3 (node:sqlite)',
    time: new Date()
  });
});

// ==========================================
// 2. Authentication API (SQLite)
// ==========================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Safe user object without sensitive password
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2026'
    };

    res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isSuper = normalizedEmail === (process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com');
    const isAdmin = isSuper || normalizedEmail.includes('admin');
    const role = isSuper ? 'superadmin' : isAdmin ? 'admin' : 'customer';

    const newUser = createUser({
      name,
      email: normalizedEmail,
      password,
      role,
      phone: phone || '',
      avatar: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
    });

    res.json({
      success: true,
      message: 'Account registered successfully in SQLite database!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        joinedDate: 'November 2026'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/auth/users', (req, res) => {
  try {
    const users = getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. Settings API (SQLite)
// ==========================================
app.get('/api/settings', (req, res) => {
  try {
    const settings = getAllSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const updates = req.body;
    const settings = updateSettings(updates);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// General Image Upload
app.post('/api/settings/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl, message: 'Image uploaded successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Store Logo Upload
app.post('/api/settings/logo', upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file provided.' });
    }
    const logoUrl = `/uploads/${req.file.filename}`;
    const settings = updateSettings({ logoUrl });

    res.json({
      success: true,
      message: 'Logo uploaded and saved in SQLite database.',
      logoUrl,
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset Store Logo
app.delete('/api/settings/logo', (req, res) => {
  try {
    const current = getAllSettings();
    if (current.logoUrl) {
      const filename = path.basename(current.logoUrl);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    const updated = updateSettings({ logoUrl: null });
    res.json({
      success: true,
      message: 'Logo reset to default in SQLite.',
      settings: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. Production: serve the built React app (dist/) with SPA fallback
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
