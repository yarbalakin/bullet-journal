const CACHE_NAME = 'bujo-v57';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/version.js',
  './js/app.js',
  './js/auth.js',
  './js/supabase-config.js',
  './js/db.js',
  './js/router.js',
  './js/sticker-system.js',
  './js/onboarding.js',
  './js/lock.js',
  './js/pages/home.js',
  './js/pages/calendar.js',
  './js/pages/tasks.js',
  './js/pages/cosmetics.js',
  './js/pages/day.js',
  './js/pages/pixels.js',
  './js/pages/future.js',
  './js/pages/collections.js',
  './js/pages/habits.js',
  './js/pages/coverPicker.js',
  './js/pages/lifewheel.js',
  './images/stickers/manifest.json',
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

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
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
  // Network-first for API calls and CDN, cache-first for assets
  if (e.request.url.includes('openbeautyfacts.org') || e.request.url.includes('unpkg.com') || e.request.url.includes('n8n.cloud')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else if (e.request.url.includes('/images/stickers/')) {
    // Sticker images: cache on first use (lazy caching)
    e.respondWith(
      caches.match(e.request).then(r => {
        if (r) return r;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
