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

function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '') // remove emojis
    .replace(/^[?\-–—•*\s:：]+/, '') // remove leading symbols
    .trim();
}

function extractCleanTitle(rawTitle, rawDesc, rawCategory, imageUrl) {
  // 1. If rawTitle is valid and not generic
  if (rawTitle && 
      !rawTitle.toLowerCase().includes('item added') && 
      !rawTitle.toLowerCase().includes('cart successfully') && 
      rawTitle.trim().length > 4) {
    return cleanString(rawTitle);
  }

  const desc = cleanString(rawDesc);

  // 2. Try extracting from brackets in description: 【...】 or [...]
  if (desc) {
    const bracketMatch = desc.match(/[【\[]([^】\]]+)[】\]]/);
    if (bracketMatch && bracketMatch[1] && bracketMatch[1].trim().length >= 4) {
      let t = bracketMatch[1].trim().replace(/[:：,\-–—]+$/, '').trim();
      if (t.length >= 4 && t.length <= 80) return t;
    }

    // Check before colon, dash, or em-dash in first 100 chars
    const firstLine = desc.split(/[\r\n]+/)[0] || '';
    const colonMatch = firstLine.match(/^([A-Za-z0-9\s/&+\-–'’()]{5,70})[:：|–—]/);
    if (colonMatch && colonMatch[1]) {
      let t = colonMatch[1].trim();
      const lower = t.toLowerCase();
      const badWords = ['features', 'specifications', 'specification', 'note', 'tips', 'about this item', 'package included', 'package includes', 'warm tips', 'usage', 'description', 'how to use'];
      if (!badWords.includes(lower) && t.length >= 6) {
        return t;
      }
    }

    // Check comma separation in first sentence e.g. "Smart Tasbih Zikr Ring, i Tasbih Salam..."
    const commaMatch = firstLine.match(/^([A-Za-z0-9\s/&+\-–'’]{6,45})[,]/);
    if (commaMatch && commaMatch[1]) {
      let t = commaMatch[1].trim();
      if (t.split(' ').length >= 2) return t;
    }

    // Try first clause / sentence
    const firstSentence = firstLine.split(/[.?!\r\n]+/)[0] || '';
    if (firstSentence.length >= 8 && firstSentence.length <= 65) {
      return firstSentence.trim();
    }
  }

  // 3. Extract from image filename slug if meaningful
  if (imageUrl) {
    const filename = imageUrl.split('/').pop().split('?')[0];
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const cleanSlug = nameWithoutExt
      .replace(/[_-][a-f0-9]{8,}$/i, '')
      .replace(/[_-]\d+-\d+$/, '')
      .replace(/^[0-9]+_/g, '')
      .replace(/[._-]+/g, ' ')
      .trim();

    const words = cleanSlug.split(' ').filter(w => /[a-z]/i.test(w) && w.length > 1);
    if (words.length >= 2 && cleanSlug.length >= 6) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  // Fallback
  return `${rawCategory} Edition Luxury Item`;
}

let genericCount = 0;
const results = [];

rows.slice(1).forEach((r, idx) => {
  if (r[0] === 'Gaming') return;
  const title = extractCleanTitle(r[1], r[5], r[0], (r[6]||'').split('|')[0]);
  if (title.includes('Edition Luxury Item') || title.length < 5) {
    genericCount++;
    results.push({ idx, cat: r[0], title, desc: (r[5]||'').slice(0, 60), img: (r[6]||'').split('|')[0] });
  }
});

console.log('Total non-gaming products:', rows.slice(1).filter(r => r[0] !== 'Gaming').length);
console.log('Generic titles count:', genericCount);
if (results.length > 0) {
  console.log('Sample generic ones:', results.slice(0, 10));
}
