import fs from 'fs';
import { mysqlPool } from '../db.js';

async function check() {
  const [rows] = await mysqlPool.query('SELECT sku, name FROM products');
  const dbSkus = new Set(rows.map(r => r.sku));
  const dbNames = new Set(rows.map(r => r.name?.toLowerCase().trim()));

  const content = fs.readFileSync('arabiadropship_products (2).csv', 'utf8');

  // Parse CSV
  const csvRows = [];
  let currentRow = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 1) csvRows.push(currentRow);
      currentRow = [];
    } else {
      currentField += char;
    }
  }
  if (currentRow.length > 1) csvRows.push(currentRow);

  const missing = [];
  csvRows.slice(1).forEach((r, idx) => {
    if ((r[0] || '').trim().toLowerCase() === 'gaming') return;
    const catCodeMap = {
      'electronics': 'ELE', 'beauty': 'BTY', 'home & kitchen accesories': 'HME',
      'tools': 'TLS', 'exercise': 'WLN', 'watches': 'WTC', 'kid toy': 'GAM',
      'health care': 'WLN', 'uae': 'LUX', 'jewellery': 'WTC', 'oils': 'BTY',
      'glasses': 'FSH', 'clothing': 'FSH', 'gadgets': 'ELE', 'fragrance': 'BTY',
      'mobile, laptop & accesories': 'ELE'
    };
    const catRaw = (r[0] || '').trim().toLowerCase();
    const catCode = catCodeMap[catRaw] || 'ELE';
    const overallIdx = idx + 1;
    const expectedSku = `VNT-${catCode}-${String(overallIdx).padStart(4, '0')}`;

    if (!dbSkus.has(expectedSku)) {
      missing.push({ idx: overallIdx, cat: r[0], title: r[1], desc: (r[5]||'').slice(0, 40), img: (r[6]||'').split('|')[0] });
    }
  });

  console.log(`Total missing products from CSV: ${missing.length}`);
  if (missing.length > 0) {
    console.log('First 10 missing sample:', missing.slice(0, 10));
  }
  process.exit(0);
}

check();
