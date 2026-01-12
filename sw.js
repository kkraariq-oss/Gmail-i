// Service Worker - sw.js
// للعمل Offline والتخزين المؤقت

const CACHE_NAME = 'restaurant-pos-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/themes.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/database.js',
  '/js/auth.js',
  '/js/theme.js',
  '/js/app.js',
  '/js/pos.js',
  '/js/products.js',
  '/js/employees.js',
  '/js/expenses.js',
  '/js/reports.js',
  '/js/invoices.js',
  '/js/backup.js',
  '/js/security.js',
  '/js/settings.js',
  '/js/print.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap'
];

// التثبيت - تخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Cache installation failed:', err);
      })
  );
  self.skipWaiting();
});

// التنشيط - حذف الملفات القديمة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// جلب الملفات - استراتيجية Cache First
self.addEventListener('fetch', event => {
  // تخطي الطلبات الخارجية (Firebase, etc)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع من الذاكرة إن وُجد
        if (response) {
          return response;
        }

        // جلب من الشبكة
        return fetch(event.request).then(response => {
          // تحقق من الاستجابة الصحيحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // نسخ الاستجابة
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // في حالة عدم توفر الشبكة، إرجاع صفحة offline
        return caches.match('/index.html');
      })
  );
});

// التزامن في الخلفية (Background Sync)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // هنا يمكن إضافة كود المزامنة مع Firebase
  console.log('Syncing data in background...');
}

// الإشعارات Push Notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'فتح',
        icon: '/images/icon-96.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/images/icon-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// التفاعل مع الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// معالجة الأخطاء
self.addEventListener('error', event => {
  console.error('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker Unhandled Rejection:', event.reason);
});
