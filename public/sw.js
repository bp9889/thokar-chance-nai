// Offline support: every request goes to the network first and the last good copy is kept,
// so the page and the latest prices still open in the bazar when the net drops.
const CACHE = 'tcn-v1'
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/prices.json'])).catch(() => {})); self.skipWaiting() })
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())) })
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('.apk')) return
  const key = req.mode === 'navigate' ? '/' : url.pathname
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)) }
      return res
    }).catch(() => caches.match(key).then((hit) => hit || caches.match('/')))
  )
})
