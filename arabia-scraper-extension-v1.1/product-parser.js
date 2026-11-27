// Product page parser for new.arabiadropship.com /view/{id} pages.
// Takes ONLY the product's own gallery images (no "related products" thumbnails),
// the real title (not the "Item Added to Cart" toast), one clean price, sku, stock,
// full description, specs, variants and breadcrumb.

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

const absUrl = (href, base) => {
  try {
    return new URL(href, base).href.split("#")[0];
  } catch {
    return "";
  }
};

// Headings/texts that are UI chrome, never a product name.
const JUNK_TITLE = /added to cart|successfully|^about this item|^product( page)?$|^delivery details|^select quantity|^categories list|^(time|mode|country|color|sku)\s*:?$|^add to (cart|wishlist)|related products|you may also|^description$|^product details?$|^specifications?$|^reviews?$|^login|^sign in|^my cart|^shopping cart|^wishlist|^categories$|^home$|^shipping|^return/i;

// Containers whose images/text do not belong to this product.
const FOREIGN_BLOCK = /related|similar|recommend|suggest|you-may|also-like|more-product|other-product|upsell|cross-sell|recently-viewed|modal|toast|cart-?drawer|mini-?cart|offcanvas|sidebar|newsletter/i;

// Tested against the full path (so /flag/uae.png and default-img.webp are caught).
const NOT_PRODUCT_IMG = /logo|favicon|icon|\/flags?\/|flag[-_.]|avatar|placeholder|loader|loading|spinner|banner|payment|visa|master|whatsapp|social|facebook|instagram|tiktok|blank\.|no-?image|default[-_.]/i;
const IMG_EXT = /\.(jpe?g|png|webp|avif|gif)(\?|$)/i;

function productIdOf(url) {
  const m = String(url).match(/\/view\/(\d+)/i);
  return m ? m[1] : "";
}

// True when the element sits inside a header/footer/nav, a modal/toast, a
// "related products" block, or a link/card pointing to a DIFFERENT product.
function isForeign(el, pid) {
  for (let n = el; n && n.nodeType === 1 && n.tagName !== "BODY"; n = n.parentElement) {
    const tag = n.tagName;
    if (tag === "HEADER" || tag === "FOOTER" || tag === "NAV" || tag === "ASIDE") return true;
    const sig = `${n.id || ""} ${typeof n.className === "string" ? n.className : ""}`;
    if (FOREIGN_BLOCK.test(sig)) return true;
    if (tag === "A") {
      const other = productIdOf(n.getAttribute("href") || "");
      if (other && other !== pid) return true;
    }
    const onclick = n.getAttribute && n.getAttribute("onclick");
    if (onclick) {
      const other = productIdOf(onclick);
      if (other && other !== pid) return true;
    }
  }
  return false;
}

// Is this element inside a section whose heading says "Related products" etc?
function underRelatedHeading(el) {
  for (let n = el; n && n.nodeType === 1 && n.tagName !== "BODY"; n = n.parentElement) {
    let prev = n.previousElementSibling;
    for (let i = 0; prev && i < 3; i++, prev = prev.previousElementSibling) {
      const t = clean(prev.textContent).slice(0, 80);
      if (/^(related|similar|recommended|you may also|more from|customers also|other) /i.test(t)) return true;
    }
  }
  return false;
}

// Block-aware text: keeps paragraph / list / line breaks that textContent loses.
function blockText(el) {
  if (!el) return "";
  const BLOCK = /^(P|DIV|LI|BR|H[1-6]|TR|UL|OL|SECTION|ARTICLE|TABLE|DL|DT|DD|BLOCKQUOTE)$/;
  let out = "";
  const walk = (n) => {
    if (n.nodeType === 3) {
      out += n.nodeValue.replace(/\s+/g, " ");
      return;
    }
    if (n.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|NOSCRIPT|BUTTON|SVG|FORM|SELECT|IFRAME)$/.test(n.tagName)) return;
    const block = BLOCK.test(n.tagName);
    if (block) out += "\n";
    if (n.tagName === "LI") out += "• ";
    n.childNodes.forEach(walk);
    if (block) out += "\n";
  };
  walk(el);
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, a) => l && !(l === "•" ) && !(i > 0 && l === a[i - 1]))
    .join("\n")
    .replace(/^about this item\s*\n?/i, "")
    .trim();
}

// Minimal, safe HTML copy of the description (tags only, no attributes/scripts).
function safeHtml(el) {
  if (!el) return "";
  const KEEP = /^(P|BR|UL|OL|LI|B|STRONG|I|EM|H2|H3|H4|H5|TABLE|THEAD|TBODY|TR|TH|TD|SPAN)$/;
  const walk = (n) => {
    if (n.nodeType === 3) return n.nodeValue.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT|BUTTON|SVG|FORM|IFRAME|IMG)$/.test(n.tagName)) return "";
    const inner = [...n.childNodes].map(walk).join("");
    if (!KEEP.test(n.tagName)) return inner;
    const t = n.tagName.toLowerCase();
    return t === "br" ? "<br>" : `<${t}>${inner}</${t}>`;
  };
  return walk(el).replace(/\s+/g, " ").replace(/<(\w+)>\s*<\/\1>/g, "").trim();
}

function bestFromSrcset(srcset) {
  if (!srcset) return "";
  let best = "", bestW = -1;
  srcset.split(",").forEach((part) => {
    const [u, d] = part.trim().split(/\s+/);
    const w = d ? parseFloat(d) * (d.endsWith("x") ? 1000 : 1) : 0;
    if (u && w >= bestW) { best = u; bestW = w; }
  });
  return best;
}

function parseAmounts(text) {
  return [...String(text).matchAll(/(?:AED|د\.إ|Dhs?)\s*([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s*(?:AED|د\.إ)/gi)]
    .map((m) => parseFloat((m[1] || m[2]).replace(/,/g, "")))
    .filter((n) => !isNaN(n) && n > 0);
}

function extractProduct(doc, url) {
  const pid = productIdOf(url);
  const all = (s) => [...doc.querySelectorAll(s)];
  const own = (s) => all(s).filter((e) => !isForeign(e, pid));
  const meta = (n) => (doc.querySelector(`meta[property="${n}"],meta[name="${n}"]`) || {}).content || "";
  // Line-separated page text, so "L3NON...496" and "In Stock" in sibling blocks don't glue together.
  const body = doc.body ? blockText(doc.body).replace(/[ \t]+/g, " ") : "";

  // ---- JSON-LD Product (if the site has it) ----
  let ld = {};
  all('script[type="application/ld+json"]').forEach((s) => {
    try {
      const j = JSON.parse(s.textContent);
      const arr = Array.isArray(j) ? j : j["@graph"] || [j];
      arr.forEach((o) => o && String(o["@type"]).includes("Product") && (ld = o));
    } catch {}
  });
  const offers = (Array.isArray(ld.offers) ? ld.offers[0] : ld.offers) || {};

  // ---- title ----
  // Site name ("Arabia Dropship") shows up in h1/og/title tags, so it is never a product name.
  const siteName = clean(meta("og:site_name")).toLowerCase();
  const isJunkTitle = (t) =>
    t.length < 3 || t.length > 250 || JUNK_TITLE.test(t) || /^(arabia\s*drop\s*ship(ping)?|seller\s*(center|centre|panel|dashboard)|dashboard)$/i.test(t) || (siteName && t.toLowerCase() === siteName);
  // The real name is the heading in the same card as "Sku:" / the price.
  const infoHeadings = [];
  const anchor = all("b, strong, span, p, label, div").find((e) => e.children.length <= 2 && /^sku\s*:?/i.test(clean(e.textContent)));
  for (let n = anchor && anchor.parentElement, i = 0; n && n.tagName !== "BODY" && i < 6; n = n.parentElement, i++) {
    const hs = [...n.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => clean(h.textContent)).filter((t) => !isJunkTitle(t) && !/^AED\b/i.test(t) && !/^bought\b/i.test(t));
    if (hs.length) { infoHeadings.push(...hs); break; }
  }
  const titleCandidates = [
    ld.name,
    ...infoHeadings,
    ...own('[class*="product-title"],[class*="product-name"],[class*="product_title"],[class*="productTitle"],[itemprop="name"]').map((e) => e.textContent),
    ...own("h1").map((e) => e.textContent),
    meta("og:title"),
    ...(doc.title || "").split(/\s[|\-–—]\s/),
    ...own("h2,h3,h4,h5").map((e) => e.textContent),
  ]
    .map(clean)
    .filter((t) => !isJunkTitle(t));
  // The site names gallery files "<product-slug>-<productId>-<n>.jpg": a reliable name source.
  const slugTitle = (() => {
    for (const img of all("img")) {
      const f = (img.getAttribute("data-src") || img.getAttribute("src") || "").split("/").pop().split("?")[0];
      const m = pid && f.match(new RegExp(`^(.+?)-${pid}-\\d+\\.\\w+$`));
      if (m) return m[1].replace(/-+/g, " ").trim();
    }
    return "";
  })();
  const words = (t) => new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  const overlap = (a, b) => [...words(a)].filter((w) => words(b).has(w)).length;
  const title =
    (slugTitle && titleCandidates.find((t) => overlap(t, slugTitle) >= Math.min(2, words(slugTitle).size))) ||
    (slugTitle && slugTitle.replace(/\b[a-z]/g, (c) => c.toUpperCase())) ||
    titleCandidates[0] ||
    "";

  // ---- images: only this product's gallery ----
  const imgs = [];
  const seen = new Set();
  const addImg = (raw) => {
    if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) return;
    const u = absUrl(raw.trim(), url);
    if (!u || !IMG_EXT.test(u) || NOT_PRODUCT_IMG.test(new URL(u).pathname)) return;
    const key = u.split("?")[0];
    if (seen.has(key)) return;
    seen.add(key);
    imgs.push(u);
  };
  [].concat(ld.image || []).forEach((i) => addImg(typeof i === "string" ? i : i && i.url));
  own("img, source, [data-zoom-image], [data-large], [data-full], [data-image], [data-thumb], [data-src]").forEach((el) => {
    if (underRelatedHeading(el)) return;
    // One file per element: the biggest version it offers (zoom > srcset > lazy > src).
    const pick = [
      ...["data-zoom-image", "data-large", "data-large-image", "data-full", "data-full-image", "data-original", "data-image"].map((a) => el.getAttribute(a)),
      bestFromSrcset(el.getAttribute("data-srcset") || el.getAttribute("srcset")),
      ...["data-src", "data-lazy-src", "data-lazy", "src"].map((a) => el.getAttribute(a)),
    ].find((v) => v && !v.startsWith("data:") && IMG_EXT.test(v));
    addImg(pick);
  });
  // lightbox links to full-size files
  own("a[href]").forEach((a) => IMG_EXT.test(a.getAttribute("href")) && !underRelatedHeading(a) && addImg(a.getAttribute("href")));
  // CSS background-image galleries
  own('[style*="background-image"]').forEach((el) => {
    const m = (el.getAttribute("style") || "").match(/url\(["']?([^"')]+)["']?\)/);
    if (m && !underRelatedHeading(el)) addImg(m[1]);
  });
  // Safety net: if a page wrapper class hid everything, fall back to all <img>s
  // minus obvious related-product cards (the end-of-run pass cleans the rest).
  if (!imgs.length) {
    all("img").forEach((el) => {
      const a = el.closest("a[href]");
      const other = a && productIdOf(a.getAttribute("href"));
      if (other && other !== pid) return;
      addImg(el.getAttribute("data-src") || el.getAttribute("src"));
    });
  }
  if (!imgs.length) addImg(meta("og:image"));
  // Real gallery files live in /products/; only fall back to other folders if none do.
  const inProducts = imgs.filter((u) => /\/products?\//i.test(new URL(u).pathname));
  const productImgs = inProducts.length ? inProducts : imgs.filter((u) => /upload|storage|media|images\//i.test(u));
  const images = productImgs.length ? productImgs : imgs;

  // ---- price (one value, plus regular price if on sale) ----
  let amounts = [];
  const priceEl = own('[class*="price"],[itemprop="price"]').find(
    (e) => !/shipping|return|delivery/i.test(e.textContent) && parseAmounts(e.textContent).length
  );
  const priceText = priceEl ? clean(priceEl.textContent).slice(0, 120) : "";
  if (offers.price) amounts = [parseFloat(offers.price)];
  if (!amounts.length && meta("product:price:amount")) amounts = [parseFloat(meta("product:price:amount"))];
  if (!amounts.length && priceEl) amounts = parseAmounts(priceEl.textContent);
  if (!amounts.length) {
    const m = body.replace(/(Shipping|Return) Charges\s*AED\s*[\d.]+/gi, "").match(/AED\s*[\d,]+(?:\.\d+)?/i);
    if (m) amounts = parseAmounts(m[0]);
  }
  const uniq = [...new Set(amounts)];
  const sale = uniq.length ? Math.min(...uniq) : "";
  const regular = uniq.length > 1 ? Math.max(...uniq) : "";

  // ---- specs: tables, dl lists, "Label: value" rows ----
  const specs = {};
  const addSpec = (k, v) => {
    k = clean(k).replace(/[:：]\s*$/, "");
    v = clean(v);
    if (/^select quantity|^quantity$|^qty$/i.test(k) || /add to cart|add to wishlist|buy now/i.test(v)) return;
    // glued rows like "Battery PoweredStyle: AngledWattage: 800 watts" or "DESCRIPTION Power source type"
    if (v.length > 150 || (v.match(/[:：]/g) || []).length > 1 || /^[A-Z]{4,}\s/.test(k) || /[a-z][A-Z][a-z]+:/.test(v)) return;
    if (k && v && k.length < 60 && !specs[k]) specs[k] = v;
  };
  own("table tr").forEach((tr) => {
    const c = tr.querySelectorAll("th,td");
    if (c.length === 2) addSpec(c[0].textContent, c[1].textContent);
  });
  own("dl").forEach((dl) => {
    const dts = dl.querySelectorAll("dt");
    dts.forEach((dt) => dt.nextElementSibling && addSpec(dt.textContent, dt.nextElementSibling.textContent));
  });
  own("li, p, span, td").forEach((el) => {
    // only leaf-ish rows: no nested lists/paragraphs, so text from several rows can't glue together
    if (el.children.length > 3 || el.querySelector("li, p, div, ul, ol, br, table")) return;
    const m = clean(el.textContent).match(/^([A-Za-z][A-Za-z /&]{1,30})\s*[:：]\s*(.{1,120})$/);
    if (m && (m[1].trim().split(/\s+/).length > 4 || /^[A-Z\s]{6,}$/.test(m[1].trim()))) return;
    if (m && /sku|brand|model|code|weight|size|color|colour|material|warranty|origin|stock|category|dimension|capacity|battery|power|quantity/i.test(m[1])) addSpec(m[1], m[2]);
  });

  // ---- sku ----
  const BAD_SKU = /^(in|out|of|stock|in stock|out of stock|available|n\/?a|na|-|none|null|category|brand)$/i;
  const specSku = Object.entries(specs).find(([k]) => /^(sku|product code|item code|code|model( no\.?)?)$/i.test(k));
  const skuRe = body.match(/\b(?:SKU|Product Code|Item Code)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-_./]{1,40})/i);
  // "Sku: L3NONYOM92434496   In Stock" sits on one row, so keep only the first token.
  const sku = [ld.sku, ld.mpn, skuRe && skuRe[1], specSku && specSku[1], clean((own('[class*="sku"]')[0] || {}).textContent).replace(/^sku\s*[:#]?\s*/i, "")]
    .map((s) => clean(s).split(" ")[0])
    .find((s) => s && !BAD_SKU.test(s)) || "";
  if (sku) Object.keys(specs).forEach((k) => /^sku$/i.test(k) && (specs[k] = sku));
  Object.keys(specs).forEach((k) => /^sku$/i.test(k) && BAD_SKU.test(specs[k]) && delete specs[k]);

  // ---- stock ----
  let stock = "";
  if (offers.availability) stock = /InStock/i.test(offers.availability) ? "In Stock" : "Out of Stock";
  const qty = body.match(/\b(\d+) ?(?:pcs|pieces|items|units)? ?(?:in stock|available)/i) || body.match(/\bStock ?[:：] ?(\d+)/i);
  if (!stock) stock = (body.match(/\b(In Stock|Out of Stock|Sold Out)\b/i) || [])[1] || "";
  const stockQty = qty ? +qty[1] : "";

  // ---- description: the longest description-like block that belongs to this product ----
  // Prefer real "description" blocks; only fall back to wider detail/tab wrappers.
  const longest = (els) => els.filter((e) => clean(e.textContent).length > 20).sort((a, b) => b.textContent.length - a.textContent.length)[0] || null;
  const descEl =
    longest(own('[class*="description"],[id*="description"],[itemprop="description"]')) ||
    longest(own('.tab-content .tab-pane,[class*="about-item"],[class*="product-detail"],[class*="product_detail"]'));
  let description = blockText(descEl);
  if (!description) description = clean(ld.description || meta("og:description") || meta("description"));

  // ---- breadcrumb / brand / variants ----
  const crumbs = own('[class*="breadcrumb"] a, [class*="breadcrumb"] li, nav[aria-label*="breadcrumb" i] a')
    .map((e) => clean(e.textContent))
    .filter((t, i, a) => t && !/^(home|product page|product|products|shop|view|arabia\s*dropship)$/i.test(t) && t !== title && a.indexOf(t) === i);
  const brand = clean((ld.brand && (ld.brand.name || ld.brand)) || specs.Brand || "");
  const variants = {};
  // Colour swatches: name from title/data attributes, else the swatch's CSS colour.
  const colors = [];
  own('[class*="color"] [title], [class*="color"] [data-color], [class*="color"] [data-value], [class*="color"] [style*="background"], [class*="colour"] [title]').forEach((el) => {
    const bg = ((el.getAttribute("style") || "").match(/background(?:-color)?\s*:\s*([^;]+)/i) || [])[1];
    const v = clean(el.getAttribute("title") || el.getAttribute("data-color") || el.getAttribute("data-value") || el.getAttribute("aria-label") || bg || "");
    if (v && v.length < 40 && !colors.includes(v)) colors.push(v);
  });
  if (colors.length) variants.color = colors;
  own("select").forEach((s) => {
    const name = clean(s.getAttribute("name") || s.id || "option");
    if (/qty|quantity|sort|lang|currency|country|city|emirate/i.test(name)) return;
    const opts = [...s.options].map((o) => clean(o.textContent)).filter((t) => t && !/^(select|choose)/i.test(t));
    if (opts.length) variants[name] = opts;
  });

  const shipping = (body.match(/Shipping Charges\s*(AED\s*[\d.]+)/i) || [])[1] || "";
  const returns = (body.match(/Return Charges\s*(AED\s*[\d.]+)/i) || [])[1] || "";
  const deliveryTime = clean((body.match(/\bTime\s*:?\s*(\d+\s*[-–]\s*\d+\s*days?)/i) || [])[1] || "");
  const bought = (body.match(/\bBought\s*(\d+)/i) || [])[1] || "";
  const details = { ...specs };
  if (shipping) details["Shipping Charges"] = shipping;
  if (returns) details["Return Charges"] = returns;

  return {
    // first 9 keys keep the old CSV column order so existing import scripts still work
    title,
    price: sale !== "" ? `AED ${sale}` : "",
    sku,
    stock,
    description,
    images, // array; joined with " | " in CSV
    details: JSON.stringify(details),
    url,
    product_id: pid,
    sale_price: sale,
    regular_price: regular,
    price_text: priceText,
    stock_qty: stockQty,
    brand,
    breadcrumb: crumbs.join(" > "),
    variants: Object.keys(variants).length ? JSON.stringify(variants) : "",
    shipping_charges: shipping,
    return_charges: returns,
    delivery_time: deliveryTime,
    bought_count: bought,
    description_html: safeHtml(descEl),
  };
}

// After the whole run: an image that shows up on many different products is a
// shared "related products" thumbnail, not part of any one product's gallery.
function dropSharedImages(list) {
  const freq = new Map();
  list.forEach((p) => new Set(p.images).forEach((u) => freq.set(u, (freq.get(u) || 0) + 1)));
  const limit = Math.max(3, Math.ceil(list.length * 0.03));
  let removed = 0;
  list.forEach((p) => {
    if (list.length < 10) return;
    const kept = p.images.filter((u) => freq.get(u) < limit);
    if (kept.length) {
      removed += p.images.length - kept.length;
      p.images = kept;
    }
  });
  return removed;
}
