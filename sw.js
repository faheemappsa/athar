// ==========================================
// Service Worker لتطبيق أثر
// التخزين المؤقت للملفات الأساسية + دعم الإشعارات
// ==========================================

const CACHE_NAME = 'athar-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/thmanyahsans-Black.otf',
  '/icon-192.png',
  '/icon-512.png'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('فشل تخزين بعض الملفات', err);
          // لا نريد أن يفشل التثبيت بسبب فشل أيقونة مفقودة
          return Promise.resolve();
        });
      })
  );
  // تفعيل الـ SW فوراً دون انتظار إغلاق المتصفح
  self.skipWaiting();
});

// استراتيجية: cache-first للملفات الثابتة، network-first للـ API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // إذا كان طلب API للصلاة أو التاريخ أو المحتوى، نفضل الشبكة مباشرة
  if (url.hostname.includes('api.aladhan.com') ||
      url.hostname.includes('api.alquran.cloud') ||
      url.hostname.includes('random-hadith-generator.vercel.app')) {
    event.respondWith(fetch(event.request).catch(() => {
      return caches.match(event.request);
    }));
    return;
  }
  
  // للملفات الثابتة: من الكاش أولاً ثم الشبكة
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});

// تفعيل Service Worker الجديد وحذف الكاش القديم
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
  
  const data = event.data.json();
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
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
