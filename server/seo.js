// Dynamic SEO routes: /robots.txt and /sitemap.xml
// Both are generated per request so they always carry the site's real domain,
// current products and current categories.

const PLACEHOLDER_SITE_URL = 'https://aerostore.com';

// Public base URL: admin SEO setting, then SITE_URL, then the request's own host.
export function getSiteUrl(req, settings) {
  const clean = (u) => String(u || '').trim().replace(/\/+$/, '');

  const configured = clean(settings?.seo?.siteUrl);
  if (configured && configured !== PLACEHOLDER_SITE_URL) return configured;

  const envUrl = clean(process.env.SITE_URL);
  if (envUrl && !/localhost|127\.0\.0\.1/.test(envUrl)) return envUrl;

  const host = String(req.get('x-forwarded-host') || req.get('host') || 'localhost').split(',')[0].trim();
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  const proto = String(req.get('x-forwarded-proto') || (isLocal ? 'http' : 'https')).split(',')[0].trim();
  return `${proto}://${host}`;
}

const xmlEscape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const DEFAULT_ROBOTS_TXT = [
  'User-agent: *',
  'Allow: /',
  '',
  '# Private, account and checkout pages',
  'Disallow: /admin',
  'Disallow: /api/',
  'Disallow: /cart',
  'Disallow: /checkout',
  'Disallow: /order-success',
  'Disallow: /orders',
  'Disallow: /profile',
  'Disallow: /wishlist',
  'Disallow: /login',
  'Disallow: /register',
  '',
  '# Internal search result pages',
  'Disallow: /*?search=',
  'Disallow: /*&search='
].join('\n');

export function registerSeoRoutes(app, { cache, getAllSettings, getAllProducts, getAllCategories }) {
  app.get('/robots.txt', async (req, res) => {
    let settings = {};
    try {
      settings = (await getAllSettings()) || {};
    } catch (_) {}

    const siteUrl = getSiteUrl(req, settings);
    const custom = typeof settings.seo?.robotsTxt === 'string' ? settings.seo.robotsTxt.trim() : '';
    // The old built-in template pointed at a placeholder domain; treat it as "not customised".
    const base = custom && !custom.includes('aerostore.com') ? custom : DEFAULT_ROBOTS_TXT;

    // Always point crawlers at this site's real sitemap, whatever the saved text says.
    const body = base
      .split(/\r?\n/)
      .filter((line) => !/^\s*(sitemap|host)\s*:/i.test(line))
      .join('\n')
      .trimEnd();

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.type('text/plain').send(`${body}\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const settings = (await getAllSettings()) || {};
      const siteUrl = getSiteUrl(req, settings);

      const cached = cache.get('sitemap');
      if (cached && cached.siteUrl === siteUrl) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.type('application/xml').send(cached.xml);
      }

      let products = [];
      try {
        products = await getAllProducts();
      } catch (_) {}
      if (!Array.isArray(products) || products.length === 0) {
        products = Array.isArray(settings.products) ? settings.products : [];
      }

      let categories = [];
      try {
        categories = await getAllCategories();
      } catch (_) {}

      const today = new Date().toISOString().split('T')[0];
      const toDate = (value) => {
        const d = value ? new Date(value) : null;
        return d && !Number.isNaN(d.getTime()) ? d.toISOString().split('T')[0] : today;
      };
      const absolute = (url) =>
        /^https?:\/\//i.test(url) ? url : `${siteUrl}/${String(url).replace(/^\/+/, '')}`;

      const urls = [];
      const addUrl = ({ loc, lastmod = today, changefreq, priority, image, imageTitle }) => {
        let entry = '  <url>\n';
        entry += `    <loc>${xmlEscape(loc)}</loc>\n`;
        entry += `    <lastmod>${lastmod}</lastmod>\n`;
        entry += `    <changefreq>${changefreq}</changefreq>\n`;
        entry += `    <priority>${priority}</priority>\n`;
        if (image) {
          entry += '    <image:image>\n';
          entry += `      <image:loc>${xmlEscape(absolute(image))}</image:loc>\n`;
          if (imageTitle) entry += `      <image:title>${xmlEscape(imageTitle)}</image:title>\n`;
          entry += '    </image:image>\n';
        }
        entry += '  </url>\n';
        urls.push(entry);
      };

      // Core static pages
      addUrl({ loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' });
      addUrl({ loc: `${siteUrl}/shop`, changefreq: 'daily', priority: '0.9' });
      addUrl({ loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.6' });
      addUrl({ loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.6' });
      addUrl({ loc: `${siteUrl}/faq`, changefreq: 'monthly', priority: '0.5' });

      // Category listing pages
      (Array.isArray(categories) ? categories : []).forEach((cat) => {
        if (!cat?.id) return;
        addUrl({
          loc: `${siteUrl}/shop?category=${encodeURIComponent(cat.id)}`,
          lastmod: toDate(cat.created_at),
          changefreq: 'daily',
          priority: '0.8',
          image: cat.image || '',
          imageTitle: cat.name
        });
      });

      // Product pages
      products.forEach((prod) => {
        if (prod?.id === undefined || prod?.id === null) return;
        const image = (Array.isArray(prod.images) && prod.images[0]) || prod.image || '';
        addUrl({
          loc: `${siteUrl}/product/${encodeURIComponent(prod.id)}`,
          lastmod: toDate(prod.createdAt),
          changefreq: 'weekly',
          priority: '0.7',
          image,
          imageTitle: prod.name
        });
      });

      const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
        urls.join('') +
        '</urlset>\n';

      cache.set('sitemap', { siteUrl, xml }, 600); // 10 minutes cache
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.type('application/xml').send(xml);
    } catch (error) {
      res.status(500).type('text/plain').send('Error generating sitemap.xml');
    }
  });
}
