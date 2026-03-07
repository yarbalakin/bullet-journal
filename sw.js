const CACHE_NAME = 'bujo-v5';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/router.js',
  './js/pages/home.js',
  './js/pages/calendar.js',
  './js/pages/tasks.js',
  './js/pages/cosmetics.js',
  './js/pages/day.js',
  './js/pages/pixels.js',
  './images/covers/01-january.jpg',
  './images/covers/02-february.jpg',
  './images/covers/03-march.jpg',
  './images/covers/04-april.jpg',
  './images/covers/05-may.jpg',
  './images/covers/06-june.jpg',
  './images/covers/07-july.jpg',
  './images/covers/08-august.jpg',
  './images/covers/09-september.jpg',
  './images/covers/10-october.jpg',
  './images/covers/11-november.jpg',
  './images/covers/12-december.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for assets
  if (e.request.url.includes('openbeautyfacts.org')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
