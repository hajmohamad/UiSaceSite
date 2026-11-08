// Service Worker for UI SACE PWA
const CACHE_NAME = 'uisace-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests or admin/api requests from caching
  if (req.method !== 'GET' || url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) {
    return;
  }

  // Stale-while-revalidate for static files & fonts
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.woff2'))
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-first for navigation requests (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
    );
  }
});
