import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configurable DB Path via env or default store.db
const dbPath = process.env.DB_PATH || path.join(dataDir, 'store.db');
export const db = new DatabaseSync(dbPath);

/**
 * Initialize SQLite Database Tables & Seed Defaults
 */
export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Settings Key-Value Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const findUser = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');

  // Seed Super Admin
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com';
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'password123';
  if (!findUser.get(superAdminEmail)) {
    db.prepare(`
      INSERT INTO users (name, email, password, role, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Super Administrator',
      superAdminEmail,
      superAdminPassword,
      'superadmin',
      '+971 50 123 4567',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    );
    console.log(`[SQLite] Seeded Super Admin: ${superAdminEmail}`);
  }

  // Seed Store Admin
  if (!findUser.get('admin@aerostore.com')) {
    db.prepare(`
      INSERT INTO users (name, email, password, role, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Store Administrator',
      'admin@aerostore.com',
      'admin123',
      'admin',
      '+1 (555) 999-0000',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    );
    console.log('[SQLite] Seeded Store Admin: admin@aerostore.com');
  }

  // Seed Demo Customer
  if (!findUser.get('jane@example.com')) {
    db.prepare(`
      INSERT INTO users (name, email, password, role, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Jane Doe',
      'jane@example.com',
      'password123',
      'customer',
      '+1 (555) 019-2834',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    );
  }

  // Migrate existing settings.json into SQLite table
  const settingsFile = path.join(dataDir, 'settings.json');
  if (fs.existsSync(settingsFile)) {
    try {
      const raw = fs.readFileSync(settingsFile, 'utf8');
      const data = JSON.parse(raw);
      for (const [k, v] of Object.entries(data)) {
        const valStr = typeof v === 'string' ? v : JSON.stringify(v);
        db.prepare(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).run(k, valStr);
      }
      console.log('[SQLite] Migrated settings.json into SQLite database table.');
    } catch (e) {
      console.error('[SQLite] Settings migration notice:', e.message);
    }
  }
}

/**
 * User Queries
 */
export function getUserByEmail(email) {
  if (!email) return null;
  return db.prepare('SELECT id, name, email, password, role, phone, avatar, created_at FROM users WHERE LOWER(email) = LOWER(?)').get(email);
}

export function createUser({ name, email, password, role = 'customer', phone = '', avatar = '' }) {
  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error('User already exists with this email address.');
  }

  const result = db.prepare(`
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

export function getAllUsers() {
  return db.prepare('SELECT id, name, email, role, phone, avatar, created_at FROM users ORDER BY id DESC').all();
}

/**
 * Settings Queries
 */
export function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
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

export function updateSettings(updates) {
  for (const [k, v] of Object.entries(updates)) {
    const valStr = typeof v === 'string' ? v : JSON.stringify(v);
    db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(k, valStr);
  }
  return getAllSettings();
}

export function deleteSettingKey(key) {
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
  return getAllSettings();
}

