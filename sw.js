// ==========================================
// Service Worker — أثر v4
// Offline-First | Background Sync | Periodic Sync
// ==========================================

const STATIC_CACHE = 'athar-static-v4';
const DATA_CACHE = 'athar-data-v4';

// الملفات الثابتة
const staticUrls = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/thmanyahsans-Regular.otf',
  '/thmanyahsans-Bold.otf',
  '/thmanyahsans-Black.otf',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/shortcut-morning.png',
  '/shortcut-evening.png',
  '/shortcut-prayer.png'
];

// المكتبة الدينية
const dataUrls = [
  '/data/quran-short-ayahs.json',
  '/data/authentic-hadiths.json',
  '/data/hisn-al-muslim-adhkar.json'
];

// ========== INSTALL ==========
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => 
        cache.addAll(staticUrls).catch(() => Promise.resolve())
      ),
      caches.open(DATA_CACHE).then(cache =>
        cache.addAll(dataUrls).catch(() => Promise.resolve())
      )
    ])
  );
  self.skipWaiting();
});

// ========== FETCH ==========
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (isExternalAPI(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(cacheFirst(event.request, DATA_CACHE));
    return;
  }
  
  event.respondWith(cacheFirst(event.request, STATIC_CACHE));
});

// ========== ACTIVATE ==========
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames
          .filter(name => !cacheWhitelist.includes(name))
          .map(name => caches.delete(name))
      )
    )
  );
  event.waitUntil(clients.claim());
});

// ========== BACKGROUND SYNC ==========
self.addEventListener('sync', event => {
  if (event.tag === 'update-athar') {
    event.waitUntil(updateDailyAthar());
  }
});

// ========== PERIODIC BACKGROUND SYNC ==========
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-athar-update') {
    event.waitUntil(updateDailyAthar());
  }
});

// ========== HELPERS ==========
function isExternalAPI(url) {
  const apiHosts = [
    'api.aladhan.com',
    'api.alquran.cloud',
    'googletagmanager.com',
    'google-analytics.com'
  ];
  return apiHosts.some(host => url.hostname.includes(host));
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw err;
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function updateDailyAthar() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'ATHAR_UPDATED' });
  });
}
