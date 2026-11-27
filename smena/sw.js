// Service worker киоска. Веса и библиотека — из кэша навсегда; страница и .js — сначала сеть (до NET_MS), иначе кэш.
// ПОДНИМАТЬ BUILD при замене моделей, библиотеки, face.js или страниц, иначе устройства будут жить со старым кэшем.
const BUILD = "2026-11-28.1";
const V = "smena-" + BUILD;
const NET_MS = 3500;
const HEAVY = /\/(vendor|models)\//;
const okRes = r => r && r.ok && r.status === 200;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("smena-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (HEAVY.test(u.pathname)) {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(r); if (hit) return hit;
      const res = await fetch(r); if (okRes(res)) c.put(r, res.clone()); return res;
    }));
  } else if (/\.(html|js)$|\/$/.test(u.pathname) && !u.pathname.endsWith("/sw.js")) {
    e.respondWith((async () => {
      const c = await caches.open(V);
      const net = fetch(r).then(res => { if (okRes(res)) c.put(r, res.clone()); return res; });
      try { return await Promise.race([net, new Promise((_, no) => setTimeout(no, NET_MS))]); }
      catch { const hit = await c.match(r, { ignoreSearch: true }); return hit || net; }
    })());
  }
});
