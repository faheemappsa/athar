// Service Worker - Athar PWA
// وقف خيري عن مسلم عوده البويني رحمه الله

const CACHE_NAME = "athar-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/fonts/Thmanyah.css",
  "/fonts/thmanyahsans-Regular.woff2",
  "/fonts/thmanyahsans-Bold.woff2",
  "/fonts/thmanyahsans-Medium.woff2",
  "/fonts/thmanyahsans-Light.woff2",
  "/fonts/thmanyahsans-Black.woff2",
];

// Install - Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Cache then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached or fetch from network
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          // Cache new requests
          if (fetchResponse.ok) {
            const clone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return fetchResponse;
        })
      );
    })
  );
});

// Push notifications (future)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "أثر", {
      body: data.body || "أثر اليوم جديد 🌅",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: "athar-daily",
      requireInteraction: true,
    })
  );
});
