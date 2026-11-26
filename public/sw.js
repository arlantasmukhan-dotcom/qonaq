/* Qonaq service worker. Hand-written, no dependencies.
 *
 * - House pages (/<village>/<slug>, /<village>/<slug>/driver) and request pages (/r/<code>):
 *   network-first, every successful response is cached, cache is used when the network fails or is slow.
 * - /api/photo/* and /_next/static/*: cache-first.
 * - Other /api/*: network-only (never cached), except GET /api/requests/<code>, which falls back
 *   to the last cached copy so a tourist offline still sees the last known status.
 * - The page posts {type:"cache-urls", urls:[...]} so the SW can proactively cache the page,
 *   its /driver card and its photos. The SW answers {type:"cache-status", page, ok}.
 *
 * Bump VERSION to invalidate every cache.
 */
const VERSION = "v1";
const PAGES = `qonaq-pages-${VERSION}`;
const ASSETS = `qonaq-assets-${VERSION}`;
const API = `qonaq-api-${VERSION}`;
const KEEP = [PAGES, ASSETS, API];
const OFFLINE_URL = "/offline";
const NETWORK_TIMEOUT_MS = 4000;
const MAX_URLS = 40;
// Next sends `Vary` headers; our proactive copies are fetched with different request headers.
const MATCH = { ignoreVary: true };

// First path segments that are app routes, never houses or villages.
const RESERVED = new Set(["api", "new", "host", "poster", "live", "offline", "r", "_next", "icon.svg", "sw.js"]);

function classify(url) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/_next/static/")) return "static";
  if (path.startsWith("/api/photo/")) return "photo";
  if (/^\/api\/requests\/[^/]+$/.test(path)) return "request-api";
  if (path.startsWith("/api/")) return "api";
  if (/^\/r\/[^/]+$/.test(path)) return "page";
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2 && parts.length <= 3 && !RESERVED.has(parts[0])) {
    if (parts.length === 3 && parts[2] !== "driver") return "other";
    return "page";
  }
  return "other";
}

function fetchWithTimeout(request, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(request, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

/** Network first; falls back to cache. If a cached copy exists the network gets only NETWORK_TIMEOUT_MS. */
async function networkFirst(request, cacheName, offlineFallback) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, MATCH);
  try {
    const res = cached ? await fetchWithTimeout(request, NETWORK_TIMEOUT_MS) : await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    // 404/500 with a good cached copy: prefer the copy.
    if (!res.ok && cached) return cached;
    return res;
  } catch {
    if (cached) return cached;
    if (offlineFallback) {
      const fallback = await caches.match(OFFLINE_URL, MATCH);
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request, MATCH);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

// ---------- lifecycle ----------

async function precacheOffline() {
  const cache = await caches.open(PAGES);
  const res = await fetch(OFFLINE_URL, { cache: "reload" });
  if (!res.ok) return;
  const html = await res.clone().text();
  await cache.put(OFFLINE_URL, res);
  // The offline page must look right without a network: cache the CSS/JS it references.
  const assets = new Set(html.match(/\/_next\/static\/[^"'\\\s)<>]+/g) || []);
  const assetCache = await caches.open(ASSETS);
  await Promise.all(
    [...assets].map(async (u) => {
      try {
        const r = await fetch(u);
        if (r.ok) await assetCache.put(u, r);
      } catch {
        /* non-fatal */
      }
    }),
  );
  await assetCache.add("/icon.svg").catch(() => {});
}

self.addEventListener("install", (event) => {
  // Never fail installation because precache failed: the SW is still useful, and we retry on activate.
  event.waitUntil(precacheOffline().catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("qonaq-") && !KEEP.includes(n)).map((n) => caches.delete(n)));
      if (!(await caches.match(OFFLINE_URL, MATCH))) await precacheOffline().catch(() => {});
      await self.clients.claim();
    })(),
  );
});

// ---------- fetch ----------

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const kind = classify(url);

  if (kind === "static" || kind === "photo") {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }
  if (kind === "request-api") {
    event.respondWith(networkFirst(request, API, false));
    return;
  }
  if (kind === "api") return; // network-only: do not touch

  if (request.mode === "navigate") {
    if (kind === "page") {
      event.respondWith(networkFirst(request, PAGES, true));
      return;
    }
    // Any other page: plain network, with the offline card if it fails.
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL, MATCH)) || new Response("Offline", { status: 503 })),
    );
  }
});

// ---------- proactive caching ----------

function allowed(u) {
  try {
    const url = new URL(u, self.location.origin);
    if (url.origin !== self.location.origin) return null;
    const kind = classify(url);
    if (kind === "photo") return { url, kind, cache: ASSETS };
    if (kind === "page") return { url, kind, cache: PAGES };
    return null;
  } catch {
    return null;
  }
}

async function warm(urls) {
  const results = await Promise.all(
    urls.slice(0, MAX_URLS).map(async (u) => {
      const a = allowed(u);
      if (!a) return true; // ignore unknown URLs, they do not affect the badge
      const cache = await caches.open(a.cache);
      const req = new Request(a.url.href, a.kind === "page" ? { headers: { Accept: "text/html" } } : undefined);
      const key = a.url.href;
      try {
        if (a.kind === "photo" && (await cache.match(key, MATCH))) return true;
        const res = await fetch(req);
        if (!res.ok) return !!(await cache.match(key, MATCH));
        await cache.put(key, res);
        return true;
      } catch {
        return !!(await cache.match(key, MATCH));
      }
    }),
  );
  return results.every(Boolean);
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "cache-urls" || !Array.isArray(data.urls)) return;
  const source = event.source;
  const page = typeof data.page === "string" ? data.page : null;
  event.waitUntil(
    warm(data.urls.filter((u) => typeof u === "string")).then((ok) => {
      if (source && typeof source.postMessage === "function") source.postMessage({ type: "cache-status", page, ok });
    }),
  );
});
