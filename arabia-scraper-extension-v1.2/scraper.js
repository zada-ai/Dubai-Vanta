const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FIELDS = ["base", "catPath", "delay", "catSel", "prodSel", "nextSel"];

let stopFlag = false;
let categories = [];
const products = new Map();

function log(msg) {
  const el = $("log");
  el.value += msg + "\n";
  el.scrollTop = el.scrollHeight;
}
function stats() {
  $("stats").textContent = `Products scrape ho chuke hain: ${products.size}`;
}

// ---------- settings ----------
chrome.storage.local.get("settings", ({ settings }) => {
  if (settings) {
    if (!settings.prodSel || !settings.prodSel.includes("/view/")) {
      settings.prodSel = "a[href*='/view/']";
    }
    FIELDS.forEach((f) => settings[f] !== undefined && ($(f).value = settings[f]));
  }
});

function saveSettings() {
  const s = {};
  FIELDS.forEach((f) => (s[f] = $(f).value));
  chrome.storage.local.set({ settings: s });
}

// ---------- fetch helpers ----------
async function getDoc(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  if (/login|signin/i.test(new URL(res.url).pathname)) {
    throw new Error("Login nahi hai. Is browser mein arabiadropship.com par login karo.");
  }
  const html = await res.text();
  return { doc: new DOMParser().parseFromString(html, "text/html"), url: res.url };
}

// Fallback agar category page JS/AJAX se render hota ho
async function getRenderedLinks(url, selector) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url, active: false }, (tab) => {
      const listener = (tabId, info) => {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(() => {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: (sel) => {
                  let list = [];
                  try { list = [...document.querySelectorAll(sel)]; } catch {}
                  if (!list.length) list = [...document.querySelectorAll("a[href]")];
                  return list
                    .map((a) => a.href)
                    .filter((h) => { try { return /\/view\/\d+/i.test(new URL(h).pathname); } catch { return false; } });
                },
                args: [selector],
              },
              (results) => {
                chrome.tabs.remove(tab.id);
                resolve((results && results[0] && results[0].result) || []);
              }
            );
          }, 2500);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

const abs = (href, base) => {
  try {
    return new URL(href, base).href.split("#")[0];
  } catch {
    return "";
  }
};

// ---------- categories ----------
function findCategories(doc, pageUrl) {
  const sel = $("catSel").value.trim();
  const out = new Map();
  const anchors = sel ? doc.querySelectorAll(sel) : doc.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const text = a.textContent.replace(/\s+/g, " ").trim();
    const m = text.match(/\(\s*(\d+)\s*\)\s*$/);
    if (!sel && !m) return;
    const url = abs(a.getAttribute("href"), pageUrl);
    if (!url || url === pageUrl || url.startsWith("javascript")) return;
    const name = text.replace(/\(\s*\d+\s*\)\s*$/, "").trim() || url;
    if (!out.has(url)) out.set(url, { name, url, expected: m ? +m[1] : null });
  });
  return [...out.values()];
}

// ---------- listing pages ----------
function productLinks(doc, pageUrl) {
  const links = new Set();
  const sel = $("prodSel").value.trim() || "a[href*='/view/']";
  const grab = (s) => {
    let list = [];
    try { list = doc.querySelectorAll(s); } catch { return; }
    list.forEach((a) => {
      const u = abs(a.getAttribute("href"), pageUrl);
      if (u && /\/view\/\d+/i.test(new URL(u).pathname)) links.add(u);
    });
  };
  grab(sel);
  // Wrong/old selector in settings? Fall back to every /view/ link on the page.
  if (!links.size) grab("a[href]");
  return links;
}

function nextLink(doc, pageUrl) {
  const sel = $("nextSel").value.trim();
  if (sel) {
    const a = doc.querySelector(sel);
    if (a && a.getAttribute("href") && !a.getAttribute("href").startsWith("javascript")) {
      return abs(a.getAttribute("href"), pageUrl);
    }
  }
  return null;
}

async function collectProducts(cat, delay) {
  const found = new Set();
  let url = cat.url;
  let page = 1;
  const visited = new Set();

  while (url && !stopFlag && page <= 300) {
    visited.add(url);
    const { doc, url: finalUrl } = await getDoc(url);
    let links = productLinks(doc, finalUrl);

    if (links.size === 0 && page === 1) {
      log(`  [${cat.name}] Static HTML mein links nahi mile, live browser tab check kar raha hoon...`);
      const sel = $("prodSel").value.trim() || "a[href*='/view/']";
      const liveLinks = await getRenderedLinks(finalUrl, sel);
      liveLinks.forEach((l) => links.add(l.split("#")[0]));
    }

    let added = 0;
    links.forEach((l) => {
      if (!found.has(l)) {
        found.add(l);
        added++;
      }
    });
    if (!added) break;

    let next = nextLink(doc, finalUrl);
    if (!next) {
      const u = new URL(cat.url);
      u.searchParams.set("page", ++page);
      next = u.href;
    } else {
      page++;
    }
    if (visited.has(next)) break;
    url = next;
    await sleep(delay);
  }
  return found;
}

// Product page parsing lives in product-parser.js (extractProduct, dropSharedImages).

// ---------- live tab mode ----------
// The site fills SKU, colours etc. with JavaScript after load, so plain fetch()
// misses them. Live mode opens the page in ONE reused background tab, waits for
// the SKU to appear, then runs the same parser on the real rendered page.
let liveTabId = null;

function waitForLoad(tabId) {
  return new Promise((resolve) => {
    const done = () => { chrome.tabs.onUpdated.removeListener(listener); clearTimeout(timer); resolve(); };
    const listener = (id, info) => id === tabId && info.status === "complete" && done();
    const timer = setTimeout(done, 30000);
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function openInLiveTab(url) {
  if (liveTabId !== null) {
    try {
      await chrome.tabs.update(liveTabId, { url });
      await waitForLoad(liveTabId);
      return liveTabId;
    } catch { liveTabId = null; }
  }
  const tab = await chrome.tabs.create({ url, active: false });
  liveTabId = tab.id;
  await waitForLoad(liveTabId);
  return liveTabId;
}

async function closeLiveTab() {
  if (liveTabId !== null) {
    try { await chrome.tabs.remove(liveTabId); } catch {}
    liveTabId = null;
  }
}

async function scrapeLive(url) {
  const tabId = await openInLiveTab(url);
  await chrome.scripting.executeScript({ target: { tabId }, files: ["product-parser.js"] });
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {
      if (/login|signin/i.test(location.pathname)) return { error: "Login nahi hai." };
      // wait (max 6s) until the SKU and gallery have been filled in by the page's JS
      for (let i = 0; i < 30; i++) {
        const t = document.body ? document.body.innerText : "";
        if (/Sku\s*:?\s*[A-Za-z0-9]{4,}/i.test(t) && !/Sku\s*:?\s*In Stock/i.test(t)) break;
        await new Promise((r) => setTimeout(r, 200));
      }
      return extractProduct(document, location.href);
    },
  });
  const p = res && res.result;
  if (!p || p.error) throw new Error((p && p.error) || "Live tab se data nahi mila");
  return p;
}

async function scrapeProduct(link) {
  if ($("liveMode").checked) {
    try {
      return await scrapeLive(link);
    } catch (e) {
      log(`  live fail (${e.message}), normal mode try kar raha hoon: ${link}`);
    }
  }
  const { doc, url } = await getDoc(link);
  return extractProduct(doc, url);
}

// ---------- UI actions ----------
$("toggleAll").onclick = (e) => {
  e.preventDefault();
  const boxes = [...document.querySelectorAll("#cats input")];
  const anyUnchecked = boxes.some((b) => !b.checked);
  boxes.forEach((b) => (b.checked = anyUnchecked));
};

$("check").onclick = async () => {
  saveSettings();
  $("log").value = "";
  try {
    const { doc, url } = await getDoc(abs($("catPath").value, $("base").value));
    categories = findCategories(doc, url);
    if (!categories.length) {
      log("Koi category link nahi mila. 'Category link selector' mein selector dalo (F12 se dekh kar).");
      return;
    }
    log(`${categories.length} categories mili.`);
    $("cats").innerHTML = "";
    categories.forEach((c, i) => {
      const l = document.createElement("label");
      l.innerHTML = `<input type="checkbox" checked data-i="${i}"> ${c.name} ${c.expected !== null ? "(" + c.expected + ")" : ""}`;
      $("cats").appendChild(l);
    });
    $("catBox").style.display = "block";
    $("start").disabled = false;
  } catch (e) {
    log("Error: " + e.message);
  }
};

$("start").onclick = async () => {
  saveSettings();
  stopFlag = false;
  products.clear();
  $("start").disabled = true;
  $("stop").disabled = false;
  $("csv").disabled = $("json").disabled = true;
  const delay = Math.max(200, +$("delay").value || 800);
  const chosen = [...document.querySelectorAll("#cats input:checked")].map((c) => categories[+c.dataset.i]);

  for (const cat of chosen) {
    if (stopFlag) break;
    try {
      log(`\n[${cat.name}] products dhoond raha hoon...`);
      const links = await collectProducts(cat, delay);
      log(`[${cat.name}] ${links.size} product links mile` + (cat.expected !== null ? ` (site ke hisab se ${cat.expected})` : ""));
      for (const link of links) {
        if (stopFlag) break;
        if (products.has(link)) {
          const p = products.get(link);
          if (!p.categories.includes(cat.name)) p.categories += " | " + cat.name;
          continue;
        }
        try {
          const p = { categories: cat.name, ...(await scrapeProduct(link)) };
          products.set(link, p);
          if (!p.title || !p.images.length) log(`  check: ${link} -> title "${p.title}", ${p.images.length} images`);
          stats();
        } catch (e) {
          log("  fail: " + link + " - " + e.message);
        }
        await sleep(delay);
      }
    } catch (e) {
      log(`[${cat.name}] error: ${e.message}`);
    }
  }
  await closeLiveTab();
  const removed = dropSharedImages([...products.values()]);
  if (removed) log(`Related-products wali ${removed} common images hata di gayin.`);
  const imgTotal = [...products.values()].reduce((n, p) => n + p.images.length, 0);
  log(`\nKhatam. Total ${products.size} unique products, ${imgTotal} images scrape hue.`);
  $("start").disabled = false;
  $("stop").disabled = true;
  $("csv").disabled = $("json").disabled = products.size === 0;
};

$("stop").onclick = () => {
  stopFlag = true;
  log("Stop kar raha hoon...");
};

function download(name, mime, data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: mime }));
  a.download = name;
  a.click();
}
const exportRows = () => [...products.values()].map((p) => ({ ...p, image_count: p.images.length, images: p.images.join(" | ") }));
$("json").onclick = () =>
  download("arabiadropship_products.json", "application/json", JSON.stringify([...products.values()], null, 2));
$("csv").onclick = () => {
  const rows = exportRows();
  // First 9 columns keep the old order (import scripts read them by position).
  const cols = [
    "categories", "title", "price", "sku", "stock", "description", "images", "details", "url",
    "product_id", "sale_price", "regular_price", "price_text", "stock_qty", "brand", "breadcrumb",
    "variants", "shipping_charges", "return_charges", "delivery_time", "bought_count", "image_count", "description_html",
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\r\n");
  download("arabiadropship_products.csv", "text/csv;charset=utf-8", "\ufeff" + csv);
};

// Test one product page and show exactly what was parsed.
$("testOne").onclick = async () => {
  $("log").value = "";
  const link = $("testUrl").value.trim();
  if (!/\/view\/\d+/.test(link)) return log("Product ka /view/123 wala link dalo.");
  try {
    log($("liveMode").checked ? "Live tab mein khol raha hoon..." : "Normal mode...");
    const p = await scrapeProduct(link);
    await closeLiveTab();
    log(`Title: ${p.title}`);
    log(`Price: ${p.price}  (regular: ${p.regular_price || "-"}, text: "${p.price_text}")`);
    log(`SKU: ${p.sku || "-"}  Stock: ${p.stock} ${p.stock_qty}`);
    log(`Brand: ${p.brand || "-"}  Breadcrumb: ${p.breadcrumb || "-"}`);
    log(`Variants: ${p.variants || "-"}`);
    log(`\nImages (${p.images.length}):`);
    p.images.forEach((u) => log(u));
    log(`\nDetails: ${p.details}`);
    log(`\nDescription:\n${p.description}`);
  } catch (e) {
    log("Error: " + e.message);
  }
};
