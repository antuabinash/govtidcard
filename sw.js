const CACHE_NAME = 'sikhya-sathi-cache-v9';

// These are the files from your repo that will be cached for offline use
const urlsToCache = [
  './',
  './index.html',
  './calculator.html',
  './fullform.html',
  './holiday.html',
  './id.html',
  './leave.html',
  './lessonplan.html',
  './news.html',
  './otet.html',
  './suchana.html',
  './textbook.html',
  './usefullapp.html',
  './style.css',
  './manifest.json',
  './icon.png' // Make sure you add icon.png to your folder!
];

// Install Event: Cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event: Serve from Cache, Fallback to Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate Event: Clear old caches when updating
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
});
