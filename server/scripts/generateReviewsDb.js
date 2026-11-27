import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customers = [
  { name: 'Rashid Al Nuaimi', location: 'Dubai Marina, Dubai' },
  { name: 'Fatima Al Mansoori', location: 'Downtown Dubai' },
  { name: 'Tariq Mehmood', location: 'Abu Dhabi Corniche' },
  { name: 'Sarah Jenkins', location: 'Palm Jumeirah, Dubai' },
  { name: 'Hamdan Al Maktoum', location: 'Al Ain, UAE' },
  { name: 'Elena Rostova', location: 'JBR, Dubai' },
  { name: 'Zayed Al Kaabi', location: 'Sharjah Al Majaz' },
  { name: 'Mariam Al Suwaidi', location: 'Ajman Corniche' },
  { name: 'Dr. Omar Farooq', location: 'Business Bay, Dubai' },
  { name: 'Ayesha Siddiqui', location: 'Al Barsha, Dubai' },
  { name: 'Mohammad Al Zaabi', location: 'Ras Al Khaimah, UAE' },
  { name: 'Chloe Davies', location: 'Dubai Hills Estate' },
  { name: 'Sultan Al Qasimi', location: 'Al Taawun, Sharjah' },
  { name: 'Noura Al Ketbi', location: 'Khalifa City, Abu Dhabi' },
  { name: 'Hassan Raza', location: 'Deira, Dubai' },
  { name: 'Khadija Al Marzooqi', location: 'Fujairah City, UAE' },
  { name: 'Bilal Mansoor', location: 'Mirdif, Dubai' },
  { name: 'Zeina Haddad', location: 'Al Reem Island, Abu Dhabi' },
  { name: 'Ali Al Shehhi', location: 'Al Hamra, RAK' },
  { name: 'Natasha Romanov', location: 'Dubai Creek Harbour' },
  { name: 'Saif Al Falasi', location: 'Jumeirah 1, Dubai' },
  { name: 'Layla Al Hashimi', location: 'Al Bateen, Abu Dhabi' },
  { name: 'Usman Qureshi', location: 'Al Nahda, Sharjah' },
  { name: 'Reem Al Shamsi', location: 'Saadiyat Island, Abu Dhabi' }
];

const commentsPool = [
  'Super fast delivery in Dubai! Ordered yesterday and received it this morning with Cash on Delivery. Top quality!',
  'Mashallah very authentic item. Exactly as shown in the pictures. The packaging was very premium and clean.',
  'Delivered to Abu Dhabi in 24 hours. The COD process was super smooth with courier rider. Highly recommend Vanta Dubai!',
  'Exceeded my expectations! Build quality is 10/10 and works flawlessly. Will definitely order again.',
  'Best purchase this month. Very premium feel and works like a charm. 5 stars all the way!',
  'Received in Sharjah. Very polite rider and allowed me to inspect the parcel before paying. Excellent service.',
  'Genuine product at a very reasonable price compared to Dubai Mall. Great value for money.',
  'Quality is top notch! My family loved it. Fast shipping and great customer support on WhatsApp.',
  '100% recommended! Seamless checkout and received tracking updates on WhatsApp. Very happy with the purchase.',
  'Really good quality. Exactly what I needed for my daily routine. 5 stars from Dubai.',
  'Ordered two pieces as gifts. Both arrived in perfect condition. Thank you Vanta Dubai team!',
  'Fast dispatch, luxury feel, and easy cash on delivery. Definitely shopping here again!',
  'Unboxing experience was awesome. The item feels very solid and premium. Delivered right on schedule.',
  'Very reliable store. Item matches description 100%. Easy cash on delivery without any hassles.',
  'Arrived safely in Al Ain within 48 hours. Well-packaged and authentic product.',
  'Great customer care. They assisted me on WhatsApp before placing order. Very satisfied.'
];

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

async function main() {
  console.log('Connecting to local MySQL aerostore_db...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aerostore_db'
  });

  console.log('Creating reviews table if not exists...');
  await conn.query(`
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
  `);

  const [products] = await conn.query('SELECT id, name, category FROM products');
  console.log(`Found ${products.length} products to generate reviews for.`);

  // Clear existing reviews to ensure clean state
  await conn.query('TRUNCATE TABLE reviews');
  console.log('Cleared existing reviews table.');

  const sqlStatements = [];
  sqlStatements.push(`-- Vanta Dubai Product Reviews Database Table & Initial Data`);
  sqlStatements.push(`CREATE TABLE IF NOT EXISTS reviews (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

  const allReviewRows = [];
  const now = new Date('2026-11-27T12:00:00Z').getTime();

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const prod = products[pIdx];
    const pid = String(prod.id);
    
    // Hash based on pid and name
    let hash = 0;
    const str = pid + (prod.name || '');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);

    const reviewCount = 10 + (hash % 3); // 10, 11, or 12 reviews
    for (let i = 0; i < reviewCount; i++) {
      const cust = customers[(hash + i * 3) % customers.length];
      const comment = commentsPool[(hash + i * 2) % commentsPool.length];
      const rRoll = (hash + i * 7) % 10;
      const rating = (rRoll === 0) ? 4.0 : ((rRoll === 1) ? 4.5 : 5.0);
      const daysAgo = 1 + ((hash * (i + 1) * 7) % 65);
      const revDate = new Date(now - daysAgo * 86400 * 1000).toISOString().slice(0, 19).replace('T', ' ');

      allReviewRows.push([
        pid,
        null,
        cust.name,
        cust.location,
        rating,
        comment,
        1,
        revDate
      ]);
    }
  }

  console.log(`Generated ${allReviewRows.length} reviews for ${products.length} products.`);

  // Insert in batches of 250 into local DB and into SQL file
  const batchSize = 250;
  for (let i = 0; i < allReviewRows.length; i += batchSize) {
    const batch = allReviewRows.slice(i, i + batchSize);
    
    // MySQL DB Insert
    await conn.query(
      'INSERT INTO reviews (product_id, user_id, customer_name, location, rating, comment, is_verified, created_at) VALUES ?',
      [batch]
    );

    // SQL dump insert statement
    const valuesSql = batch.map(row => 
      `(${escapeSql(row[0])}, ${row[1] === null ? 'NULL' : row[1]}, ${escapeSql(row[2])}, ${escapeSql(row[3])}, ${row[4]}, ${escapeSql(row[5])}, ${row[6]}, ${escapeSql(row[7])})`
    ).join(',\n');

    sqlStatements.push(`INSERT INTO reviews (product_id, user_id, customer_name, location, rating, comment, is_verified, created_at) VALUES\n${valuesSql};`);
  }

  const [verify] = await conn.query('SELECT count(*) as count FROM reviews');
  console.log(`Successfully inserted into local MySQL reviews table! Total reviews count: ${verify[0].count}`);

  const outSql = sqlStatements.join('\n\n');
  const rootSqlPath = path.join(__dirname, '../../reviews_table_and_data.sql');
  const distSqlPath = path.join(__dirname, '../../dist/reviews_table_and_data.sql');

  fs.writeFileSync(rootSqlPath, outSql, 'utf8');
  console.log(`Wrote SQL file to ${rootSqlPath} (${(outSql.length / 1024 / 1024).toFixed(2)} MB)`);

  if (fs.existsSync(path.dirname(distSqlPath))) {
    fs.writeFileSync(distSqlPath, outSql, 'utf8');
    console.log(`Copied SQL file to ${distSqlPath}`);
  }

  await conn.end();
  console.log('All done successfully!');
}

main().catch(err => {
  console.error('Error generating reviews:', err);
  process.exit(1);
});
