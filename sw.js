
const CACHE_NAME = 'chungduong-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Hoặc đường dẫn đã biên dịch của index.tsx nếu có build step
  '/manifest.json',
  // Thêm các tài nguyên tĩnh khác nếu có, ví dụ: CSS, hình ảnh, font
  // Ví dụ: '/styles.css', '/images/logo.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvGFpt5XzwiYiKz7Zptg.woff2',
  'https://fonts.gstatic.com/s/outfit/v12/QGYvz_MVcBl_g_HwwEU7EQ.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
