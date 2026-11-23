import mysql from 'mysql2/promise';

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'aerostore_db'
    });
    console.log('Connected to XAMPP MySQL aerostore_db!');

    // 1. Super Admin
    await conn.query(`
      INSERT INTO users (name, email, password, role, phone, avatar) 
      VALUES ('Sohaib Mehmood', 'sohaibmehmood0067@gmail.com', 'sohaibmehmood0067@gmail.com', 'superadmin', '+971 50 123 4567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80')
      ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role='superadmin'
    `);
    console.log('✅ Super Admin (sohaibmehmood0067@gmail.com) verified!');

    // 2. Super Manager
    await conn.query(`
      INSERT INTO users (name, email, password, role, phone, avatar) 
      VALUES ('Store Super Manager', 'manager@aerostore.com', 'password123', 'supermanager', '+971 52 987 6543', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80')
      ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role='supermanager'
    `);
    console.log('✅ Super Manager (manager@aerostore.com) verified!');

    // Remove obsolete test duplicate category if present
    await conn.query(`DELETE FROM categories WHERE id = 'audio-storage-luxury'`);

    // 3. Rich Categories matching user visual specifications
    const richCategories = [
      ['electronics', 'Electronics', 'RiSmartphoneLine', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80', 24, 'Headphones, gadgets, smartphones, and audio gear.'],
      ['fashion', 'Fashion & Apparel', 'RiShirtLine', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', 36, 'Designer apparel, seasonal wear, and luxury clothing.'],
      ['luxury', 'Luxury & Bags', 'RiSparkling2Line', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80', 19, 'Handcrafted leather bags, designer jewelry, and accessories.'],
      ['home-decor', 'Home & Living', 'RiHome4Line', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&auto=format&fit=crop&q=80', 18, 'Modern furniture, minimalist decor, and art.'],
      ['wellness', 'Fitness & Wellness', 'RiHeartPulseLine', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80', 15, 'Athletic gear, fitness trackers, and wellness goods.'],
      ['beauty', 'Health & Beauty', 'RiHeartPulseLine', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80', 21, 'Organic skincare, perfumes, and beauty essentials.'],
      ['groceries', 'Groceries & Gourmet', 'RiShoppingBasketLine', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80', 29, 'Fresh imported groceries, pantry staples, and snacks.'],
      ['sneakers', 'Sneakers & Shoes', 'RiFootprintLine', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', 32, 'Limited edition sneakers, footwear, and running shoes.'],
      ['watches', 'Watches & Jewelry', 'RiSparkling2Line', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80', 14, 'Luxury Swiss watches and bespoke jewelry pieces.'],
      ['gaming-vr', 'Gaming & VR', 'RiGamepadLine', 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&auto=format&fit=crop&q=80', 12, 'High performance gaming gear and VR devices.']
    ];

    for (const [id, name, icon, image, count, description] of richCategories) {
      await conn.query(`
        INSERT INTO categories (id, name, icon, image, count, description)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), image=VALUES(image), count=VALUES(count), description=VALUES(description)
      `, [id, name, icon, image, count, description]);
    }
    console.log('✅ Categories successfully updated in XAMPP MySQL!');

    const [users] = await conn.query('SELECT id, name, email, role FROM users');
    console.table(users);

    const [cats] = await conn.query('SELECT id, name, count, image FROM categories');
    console.table(cats);

    await conn.end();
  } catch (err) {
    console.error('MySQL Run Error:', err);
  }
}

run();
