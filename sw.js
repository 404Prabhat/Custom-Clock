// sw.js - The Service Worker

const CACHE_NAME = 'art-clock-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/js/main.js',
  '/js/interactive.js',
  '/js/animations/index.js',
  '/js/animations/artistic.js',
  '/js/animations/clock.js',
  '/js/animations/generative.js',
  '/js/animations/particle.js',
  '/js/animations/retro.js',
  '/js/utils/helpers.js',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600&family=VT323&family=Share+Tech+Mono&display=swap'
];

// Install event: cache all the core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network, then cache it
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
