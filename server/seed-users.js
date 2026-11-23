import { mysqlPool, sqliteDb, isMysql, getAllUsers } from './db.js';

async function seed() {
  console.log('Seeding Super Admin and Super Manager. isMysql:', isMysql);

  const superEmail = 'sohaibmehmood0067@gmail.com';
  const superPass = 'sohaibmehmood0067@gmail.com';
  const superName = 'Sohaib Mehmood';

  const managerEmail = 'manager@aerostore.com';
  const managerPass = 'password123';
  const managerName = 'Store Super Manager';

  // 1. Seed / Update MySQL
  if (isMysql) {
    // Delete any old superadmin email so the new one is the primary
    await mysqlPool.query(
      `INSERT INTO users (name, email, password, role, phone, avatar) 
       VALUES (?, ?, ?, 'superadmin', '+971 50 123 4567', '/storage/upload-1794836899660.png')
       ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role='superadmin'`,
      [superName, superEmail, superPass]
    );

    await mysqlPool.query(
      `INSERT INTO users (name, email, password, role, phone, avatar) 
       VALUES (?, ?, ?, 'supermanager', '+971 52 987 6543', '/storage/upload-1794836899660.png')
       ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role='supermanager'`,
      [managerName, managerEmail, managerPass]
    );

    // Also populate rich categories so categories rail is full and beautiful!
    const richCategories = [
      ['electronics', 'Electronics', 'RiSmartphoneLine', '/storage/upload-1794836899660.png', 24, 'Headphones, gadgets, smartphones, and audio.'],
      ['fashion', 'Fashion & Apparel', 'RiShirtLine', '', 36, 'Designer apparel, seasonal wear, and luxury clothing.'],
      ['luxury', 'Luxury & Bags', 'RiSparkling2Line', '', 19, 'Handcrafted leather bags, designer jewelry, and accessories.'],
      ['home-decor', 'Home & Living', 'RiHome4Line', '', 18, 'Modern furniture, minimalist decor, and art.'],
      ['wellness', 'Fitness & Wellness', 'RiHeartPulseLine', '', 15, 'Athletic gear, fitness trackers, and wellness goods.'],
      ['gaming-vr', 'Gaming & VR', 'RiGamepadLine', '', 12, 'High performance gaming gear and VR devices.'],
      ['beauty', 'Health & Beauty', 'RiHeartPulseLine', '', 21, 'Organic skincare, perfumes, and beauty essentials.'],
      ['groceries', 'Groceries & Gourmet', 'RiShoppingBasketLine', '', 29, 'Fresh imported groceries, pantry staples, and snacks.'],
      ['sneakers', 'Sneakers & Shoes', 'RiFootprintLine', '', 32, 'Limited edition sneakers, footwear, and running shoes.'],
      ['watches', 'Watches & Jewelry', 'RiSparkling2Line', '', 14, 'Luxury Swiss watches and bespoke jewelry pieces.']
    ];

    for (const [id, name, icon, image, count, description] of richCategories) {
      await mysqlPool.query(
        `INSERT INTO categories (id, name, icon, image, count, description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), count=VALUES(count), description=VALUES(description)`,
        [id, name, icon, image, count, description]
      );
    }

    console.log('✅ MySQL Users and Categories populated successfully!');
  }

  // 2. Also update SQLite
  if (sqliteDb) {
    sqliteDb.prepare(`
      INSERT INTO users (name, email, password, role, phone, avatar) 
      VALUES (?, ?, ?, 'superadmin', '+971 50 123 4567', '/storage/upload-1794836899660.png')
      ON CONFLICT(email) DO UPDATE SET name=excluded.name, password=excluded.password, role='superadmin'
    `).run(superName, superEmail, superPass);

    sqliteDb.prepare(`
      INSERT INTO users (name, email, password, role, phone, avatar) 
      VALUES (?, ?, ?, 'supermanager', '+971 52 987 6543', '/storage/upload-1794836899660.png')
      ON CONFLICT(email) DO UPDATE SET name=excluded.name, password=excluded.password, role='supermanager'
    `).run(managerName, managerEmail, managerPass);

    console.log('✅ SQLite Users populated successfully!');
  }

  const users = await getAllUsers();
  console.log('\n--- All Database Users ---');
  console.table(users);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
