const CACHE_NAME = 'finance-tracker-cache-v1';
const urlsToCache = [
  '/', // Alias for index.html
  '/index.html',
  '/style.css',
  '/script.js',
  '/ui.js',
  '/data.js',
  '/manifest.json',
  '/apple-touch-icon.png' // Cache the correct PNG icon
  // Add other assets like fonts or images if needed later
];

// Install event: Cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
      .catch(error => {
          console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open clients
  );
});

// Fetch event: Serve cached assets first, fallback to network
self.addEventListener('fetch', event => {
  // We only want to cache GET requests for our app's assets
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('[Service Worker] Serving from cache:', event.request.url);
          return response; // Serve from cache
        }
        // console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request) // Fetch from network
          .then(networkResponse => {
            // Optional: Cache dynamically fetched resources if needed
            // Be careful caching everything, especially API calls if they exist later
            // if (networkResponse && networkResponse.status === 200 && urlsToCache.includes(new URL(event.request.url).pathname)) {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME).then(cache => {
            //     cache.put(event.request, responseToCache);
            //   });
            // }
            return networkResponse;
          })
          .catch(error => {
              console.error('[Service Worker] Fetch failed:', error);
              // Optional: Return a fallback offline page if fetch fails
              // return caches.match('/offline.html');
          });
      })
  );
});