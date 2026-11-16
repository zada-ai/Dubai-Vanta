import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { categories as initialCategories, products as initialProducts } from '../src/data/mockData.js';

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
        console.log(`[Migration] Loaded env from: ${p}`);
        break;
      } catch (err) {
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

const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

console.log('========================================================');
console.log('⚡ AEROSTORE / DUBAI VANTA - DATABASE MIGRATION');
console.log('========================================================');
console.log(`DB Type: ${dbType.toUpperCase()}`);
console.log(`Super Admin: ${process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com'}`);

export async function runMigration() {
  if (dbType === 'mysql') {
    await runMysqlMigration();
  } else {
    runSqliteMigration();
  }
}

/**
 * ========================================================
 * 🐬 MYSQL MIGRATION (XAMPP / MariaDB)
 * ========================================================
 */
async function runMysqlMigration() {
  let mysql;
  try {
    mysql = await import('mysql2/promise');
  } catch (err) {
    console.error('❌ mysql2 package is required. Run: npm install mysql2');
    process.exit(1);
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'aerostore_db';

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);

  try {
    // 1. Connect without DB first to ensure DB exists
    const rootConn = await mysql.createConnection({ host, port, user, password });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConn.end();
    console.log(`✅ Database \`${database}\` verified / created.`);

    // 2. Connect to the specific database
    const conn = await mysql.createConnection({ host, port, user, password, database });

    // 3. Read and execute schema statements
    const schemaPath = path.join(__dirname, 'schema.mysql.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await conn.query(statement);
      }
      console.log('✅ 5 MySQL Tables Created / Verified (users, products, orders, settings, categories)');
    }

    // 4. Seed or Copy Data from existing SQLite DB if present
    const sqlitePath = process.env.DB_PATH || path.join(__dirname, 'data', 'store.db');
    let hasCopiedFromSqlite = false;

    if (fs.existsSync(sqlitePath)) {
      try {
        console.log(`🔄 Found existing SQLite store.db at ${sqlitePath}. Synchronizing data to MySQL...`);
        const sqliteDb = new DatabaseSync(sqlitePath);

        // A. Copy Settings
        const settingsRows = sqliteDb.prepare('SELECT key, value FROM settings').all();
        for (const row of settingsRows) {
          await conn.query(
            'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
            [row.key, row.value]
          );
        }

        // B. Copy Categories
        const catRows = sqliteDb.prepare('SELECT * FROM categories').all();
        for (const c of catRows) {
          await conn.query(
            'INSERT INTO categories (id, name, icon, image, count, description) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), image = VALUES(image), description = VALUES(description)',
            [c.id, c.name, c.icon || 'RiShoppingBagLine', c.image || '', c.count || 0, c.description || '']
          );
        }

        // C. Copy Products
        const prodRows = sqliteDb.prepare('SELECT * FROM products').all();
        for (const p of prodRows) {
          await conn.query(
            'INSERT INTO products (id, name, brand, category, price, discount_price, stock, image, alt_text, description, is_featured, is_bestseller, is_new) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), discount_price = VALUES(discount_price), is_featured = VALUES(is_featured), is_bestseller = VALUES(is_bestseller), is_new = VALUES(is_new)',
            [
              p.id,
              p.name,
              p.brand || '',
              p.category || 'electronics',
              p.price,
              p.discount_price,
              p.stock || 10,
              p.image || '',
              p.alt_text || p.name,
              p.description || '',
              p.is_featured ? 1 : 0,
              p.is_bestseller ? 1 : 0,
              p.is_new ? 1 : 0
            ]
          );
        }

        // D. Copy Users
        const userRows = sqliteDb.prepare('SELECT * FROM users').all();
        for (const u of userRows) {
          await conn.query(
            'INSERT INTO users (id, name, email, password, role, phone, avatar) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role), name = VALUES(name), phone = VALUES(phone)',
            [u.id, u.name, u.email, u.password, u.role, u.phone || '', u.avatar || '']
          );
        }

        // E. Copy Orders
        const orderRows = sqliteDb.prepare('SELECT * FROM orders').all();
        for (const o of orderRows) {
          await conn.query(
            'INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, currency, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE order_status = VALUES(order_status), payment_status = VALUES(payment_status)',
            [
              o.id,
              o.user_id,
              o.customer_name,
              o.customer_email,
              o.customer_phone,
              o.shipping_address,
              o.items,
              o.total_amount,
              o.currency || 'AED',
              o.payment_method || 'Cash on Delivery',
              o.payment_status || 'Pending',
              o.order_status || 'Processing'
            ]
          );
        }

        hasCopiedFromSqlite = true;
        console.log('✅ SQLite data successfully synchronized into MySQL!');
      } catch (copyErr) {
        console.warn('⚠️ SQLite sync note:', copyErr.message);
      }
    }

    // 5. Ensure Super Admin Exists
    const superEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com').toLowerCase();
    const superPass = process.env.SUPERADMIN_PASSWORD || 'password123';
    const superName = process.env.SUPERADMIN_NAME || 'Super Administrator';

    const [existingUsers] = await conn.query('SELECT id, email, role FROM users WHERE LOWER(email) = LOWER(?)', [superEmail]);
    if (existingUsers.length === 0) {
      await conn.query(
        'INSERT INTO users (name, email, password, role, phone, avatar) VALUES (?, ?, ?, "superadmin", ?, ?)',
        [superName, superEmail, superPass, '+971 50 123 4567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80']
      );
      console.log(`👑 Seeded Super Admin: ${superEmail} (Role: superadmin)`);
    } else {
      await conn.query('UPDATE users SET role = "superadmin" WHERE id = ?', [existingUsers[0].id]);
      console.log(`👑 Verified Super Admin: ${superEmail} (Role: superadmin)`);
    }

    // 6. Ensure Store Admin Exists
    const [existingAdmins] = await conn.query('SELECT id FROM users WHERE LOWER(email) = "admin@aerostore.com"');
    if (existingAdmins.length === 0) {
      await conn.query(
        'INSERT INTO users (name, email, password, role, phone, avatar) VALUES (?, ?, ?, "admin", ?, ?)',
        ['Store Administrator', 'admin@aerostore.com', 'admin123', '+971 50 999 0000', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80']
      );
      console.log('👔 Seeded Store Admin: admin@aerostore.com (Role: admin)');
    }

    // 7. Ensure Products Exist
    const [[prodCount]] = await conn.query('SELECT COUNT(*) as count FROM products');
    if (prodCount.count === 0 && Array.isArray(initialProducts)) {
      for (const p of initialProducts) {
        await conn.query(
          'INSERT INTO products (id, name, brand, category, price, discount_price, stock, image, alt_text, description, is_featured, is_bestseller, is_new) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            p.id,
            p.name,
            p.brand || '',
            p.category || 'electronics',
            Number(p.price || 0),
            p.discountPrice ? Number(p.discountPrice) : null,
            p.stock !== undefined ? p.stock : 10,
            p.images?.[0] || p.image || '',
            p.altText || p.name,
            p.description || '',
            p.isFeatured ? 1 : 0,
            p.isBestSeller ? 1 : 0,
            p.isNewArrival ? 1 : 0
          ]
        );
      }
      console.log(`📦 Seeded ${initialProducts.length} products into MySQL 'products' table.`);
    }

    // 8. Ensure Categories Exist
    const [[catCount]] = await conn.query('SELECT COUNT(*) as count FROM categories');
    if (catCount.count === 0 && Array.isArray(initialCategories)) {
      for (const c of initialCategories) {
        await conn.query(
          'INSERT INTO categories (id, name, icon, image, count, description) VALUES (?, ?, ?, ?, ?, ?)',
          [c.id, c.name, c.icon || 'RiShoppingBagLine', c.image || '', c.count || 0, c.description || '']
        );
      }
      console.log(`🏷️ Seeded ${initialCategories.length} categories into MySQL 'categories' table.`);
    }

    // 9. Ensure Orders Exist
    const [[orderCount]] = await conn.query('SELECT COUNT(*) as count FROM orders');
    if (orderCount.count === 0) {
      await conn.query(
        'INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, currency, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          'ORD-894210',
          1,
          'Jane Doe',
          'jane@example.com',
          '+971 50 019 2834',
          'Downtown Dubai, Boulevard Plaza, Dubai, UAE',
          JSON.stringify([
            { id: 1, name: 'AeroSound Max Wireless Headphones', price: 249.99, quantity: 1, color: '#000000', size: 'Standard' }
          ]),
          249.99,
          'AED',
          'Cash on Delivery',
          'Pending (Pay upon arrival)',
          'Processing'
        ]
      );
      console.log('💵 Seeded sample Cash on Delivery order into MySQL "orders" table.');
    }

    // 10. Table Statistics Verification
    const [[uC]] = await conn.query('SELECT COUNT(*) as count FROM users');
    const [[pC]] = await conn.query('SELECT COUNT(*) as count FROM products');
    const [[oC]] = await conn.query('SELECT COUNT(*) as count FROM orders');
    const [[sC]] = await conn.query('SELECT COUNT(*) as count FROM settings');
    const [[cC]] = await conn.query('SELECT COUNT(*) as count FROM categories');

    console.log('--------------------------------------------------------');
    console.log('📊 MYSQL MIGRATION SUMMARY:');
    console.log(`   - Users:      ${uC.count} rows (Super Admin active)`);
    console.log(`   - Products:   ${pC.count} rows (Full catalog)`);
    console.log(`   - Categories: ${cC.count} rows (Dynamic categories)`);
    console.log(`   - Orders:     ${oC.count} rows (Cash on Delivery configured)`);
    console.log(`   - Settings:   ${sC.count} rows (Branding, SEO, Promo Banner)`);
    console.log('--------------------------------------------------------');
    console.log('🎉 MySQL Migration completed successfully!');
    console.log('========================================================');

    await conn.end();
  } catch (err) {
    console.error('❌ MySQL Migration failed:', err.message);
    process.exit(1);
  }
}

/**
 * ========================================================
 * 🗃️ SQLITE MIGRATION FALLBACK
 * ========================================================
 */
function runSqliteMigration() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DB_PATH || path.join(dataDir, 'store.db');
  const db = new DatabaseSync(dbPath);

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
    console.log('✅ 5 Lightweight SQLite Tables Created / Verified');

    const superEmail = (process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com').toLowerCase();
    const superPass = process.env.SUPERADMIN_PASSWORD || 'password123';
    const superName = process.env.SUPERADMIN_NAME || 'Super Administrator';

    const findUser = db.prepare('SELECT id, email, role FROM users WHERE LOWER(email) = LOWER(?)');
    const existingSuper = findUser.get(superEmail);

    if (!existingSuper) {
      db.prepare(`
        INSERT INTO users (name, email, password, role, phone, avatar)
        VALUES (?, ?, ?, 'superadmin', ?, ?)
      `).run(superName, superEmail, superPass, '+971 50 123 4567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
      console.log(`👑 Seeded Super Admin: ${superEmail} (Role: superadmin)`);
    } else {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run('superadmin', existingSuper.id);
      console.log(`👑 Verified Super Admin: ${superEmail} (Role: superadmin)`);
    }

    console.log('🎉 SQLite Migration completed successfully!');
  } catch (err) {
    console.error('❌ SQLite Migration failed:', err.message);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigration();
}
