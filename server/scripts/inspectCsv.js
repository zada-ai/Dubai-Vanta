import fs from 'fs';

const content = fs.readFileSync('arabiadropship_products (2).csv', 'utf8');

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

function cleanTitle(rawTitle, desc, rawCategory, imageUrl) {
  // If rawTitle is valid and not generic
  if (rawTitle && 
      !rawTitle.toLowerCase().includes('item added') && 
      !rawTitle.toLowerCase().includes('cart successfully') && 
      rawTitle.trim().length > 4) {
    return rawTitle.trim();
  }

  // Try extracting from brackets in description: 【...】 or [...]
  if (desc) {
    const bracketMatch = desc.match(/[【\[]([^】\]]+)[】\]]/);
    if (bracketMatch && bracketMatch[1] && bracketMatch[1].trim().length >= 4) {
      let t = bracketMatch[1].trim();
      // clean trailing punctuation or colons
      t = t.replace(/[:：,\-–]+$/, '').trim();
      if (t.length >= 4 && t.length <= 90) return t;
    }

    // Try extracting before colon or dash in first sentence
    const firstSentence = desc.split(/[\r\n.]+/)[0] || '';
    const colonMatch = firstSentence.match(/^([A-Za-z0-9\s/&+\-–]{5,70})[:：–—]/);
    if (colonMatch && colonMatch[1]) {
      let t = colonMatch[1].trim();
      if (t.length >= 6) return t;
    }

    // If first sentence is reasonably short (< 60 chars) and not generic
    if (firstSentence.trim().length >= 10 && firstSentence.trim().length <= 65) {
      return firstSentence.trim();
    }
  }

  // Fallback to image filename slug if meaningful
  if (imageUrl) {
    const filename = imageUrl.split('/').pop().split('?')[0];
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    // Remove trailing hash numbers like -424-814 or _6ab535f2d7063
    const cleanSlug = nameWithoutExt
      .replace(/[_-][a-f0-9]{8,}$/i, '')
      .replace(/[_-]\d+-\d+$/, '')
      .replace(/[._-]+/g, ' ')
      .trim();

    // Check if cleanSlug is words and not random chars
    if (cleanSlug.length >= 6 && !/^[0-9a-f]{10,}$/i.test(cleanSlug)) {
      return cleanSlug.replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  // Fallback
  return `${rawCategory} Special Item`;
}

// Sample across categories
const sampledIndices = [1, 10, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];
sampledIndices.forEach(idx => {
  if (idx < rows.length) {
    const r = rows[idx];
    const title = cleanTitle(r[1], r[5], r[0], (r[6]||'').split('|')[0]);
    console.log(`[Idx ${idx} | ${r[0]}] -> "${title}"`);
    console.log(`  Desc prefix: ${(r[5]||'').slice(0, 80).replace(/\n/g, ' ')}`);
  }
});
