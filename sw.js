// ==========================================
// Service Worker لتطبيق أثر
// يدعم: التخزين المؤقت، الإشعارات، التحديثات التلقائية
// ==========================================

const CACHE_NAME = 'athar-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/thmanyahsans-Black.otf'
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] تم فتح الكاش');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('[SW] فشل تخزين بعض الملفات', err);
          // لا نريد أن يفشل التثبيت بسبب خطأ في ملف واحد
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting(); // تفعيل الـ SW فوراً
});

// استراتيجية التخزين: Cache First ثم Network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // طلبات APIs الخارجية تذهب مباشرة للشبكة (مع fallback للكاش إن وجد)
  if (url.hostname.includes('api.aladhan.com') ||
      url.hostname.includes('api.alquran.cloud') ||
      url.hostname.includes('random-hadith-generator.vercel.app') ||
      url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('google-analytics.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // للملفات الثابتة: من الكاش أولاً
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
  );
});

// تفعيل الـ SW الجديد وحذف الكاش القديم
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

// ========== دعم الإشعارات (Push Notifications) ==========
self.addEventListener('push', event => {
  if (!event.data) return;
  
  let data = {};
  try {
    data = event.data.json();
  } catch(e) {
    data = { title: 'أثر', body: event.data.text() };
  }
  
  const title = data.title || 'أثر';
  const options = {
    body: data.body || 'حان وقت الصلاة أو ذكر جديد',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
