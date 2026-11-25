import fs from 'fs';
import sharp from 'sharp';

const content = fs.readFileSync('arabiadropship_products (2).csv', 'utf8');

// Parse rows
const rows = [];
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
    if (currentRow.length > 1) rows.push(currentRow);
    currentRow = [];
  } else {
    currentField += char;
  }
}
if (currentRow.length > 1) rows.push(currentRow);

const urls = [];
for (let i = 1; i <= 20; i++) {
  const r = rows[i];
  const imgStr = r[6] || '';
  const firstUrl = imgStr.split('|')[0].trim();
  if (firstUrl.startsWith('http')) urls.push(firstUrl);
}

console.log('Testing', urls.length, 'URLs...');
const start = Date.now();

async function run() {
  let done = 0;
  let totalBytes = 0;
  await Promise.all(urls.map(async (u) => {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) return;
      const buf = Buffer.from(await res.arrayBuffer());
      const webp = await sharp(buf).webp({ quality: 75 }).toBuffer();
      done++;
      totalBytes += webp.length;
    } catch (e) {
      console.error('Err:', e.message);
    }
  }));
  const elapsed = (Date.now() - start) / 1000;
  console.log(`Downloaded & converted ${done} images in ${elapsed.toFixed(2)}s (${(totalBytes / 1024).toFixed(1)} KB total, ${(totalBytes / done / 1024).toFixed(1)} KB/img, ${(done / elapsed).toFixed(1)} img/sec)`);
}

run();
