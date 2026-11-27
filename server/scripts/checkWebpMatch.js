import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCsv(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
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
  return rows;
}

const csvPath = path.resolve(__dirname, '..', '..', 'arabiadropship_products (7).csv');
const rows = parseCsv(csvPath).slice(1);
const uploadsDir = path.resolve(__dirname, '..', '..', 'storage', 'uploads');
const existingFiles = new Set(fs.readdirSync(uploadsDir));

console.log('Total CSV rows:', rows.length);
console.log('Total files in storage/uploads:', existingFiles.size);

let matchCount = 0;
// Check sample matches
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const urls = (r[6] || '').split('|').map(u => u.trim());
  const firstUrl = urls[0];
  if (firstUrl) {
    const filename = path.basename(firstUrl.split('?')[0]);
    // check if any existing file matches or is webp
  }
}

process.exit(0);
