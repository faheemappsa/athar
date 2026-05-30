// Service Worker - Athar PWA (تم التصحيح)
const CACHE_NAME = "athar-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/fonts/Thmanyah.css",
  "/fonts/thmanyahsans-Medium.woff2",
  "/fonts/thmanyahsans-Regular.woff2",
  "/fonts/thmanyahsans-Bold.woff2",
  "/fonts/thmanyahsans-Light.woff2",
  "/fonts/thmanyahsans-Black.woff2",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - Clean up old caches
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
  self.clients.claim(); // Take control of all clients
});

// Fetch event - Cache first, then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache new successful requests
        if (fetchResponse.ok) {
          const clone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return fetchResponse;
      });
    })
  );
});

// Push event - Handle receiving push notifications
self.addEventListener("push", (event) => {
  let data = {
    title: "أثر",
    body: "تذكير جديد من أثر",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: "athar-daily",
    requireInteraction: true,
    data: { url: "/" }, // URL to open when notification is clicked
  };

  // Parse notification data if available
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error("Failed to parse push data", e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      data: data.data,
    })
  );
});

// Notification click event - Open the app when notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
