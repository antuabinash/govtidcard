const CACHE_NAME = 'sikhya-sathi-cache-v11'; 

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
  './lsplan.html',            // Interactive lesson planner
  './PrintablePlan.html',     // Printable plan generator
  './news.html',
  './otet.html',
  './suchana.html',
  './textbook.html',
  './usefullapp.html',
  './style.css',
  './manifest.json',
  './icon.png',
  './db_chunks/index.json'    // Required so the class list shows up offline
];

// Install Event: Cache essential files initially
self.addEventListener('install', event => {
  self.skipWaiting(); // Forces the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event: NETWORK FIRST, Fallback to Cache
self.addEventListener('fetch', event => {
  // We only want to handle GET requests (browsers throw errors if you try to cache POSTs)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If we get a valid response from the network, we update the cache with this fresh version
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If the network fetch fails (e.g., user is offline), serve from the local cache
        return caches.match(event.request);
      })
  );
});

// Activate Event: Clear old caches when updating
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim()); // Take control of all pages immediately
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
