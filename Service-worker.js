// service-worker.js

const CACHE_NAME = 'lottery-results-v1';
const OFFLINE_URL = 'offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/', // Main index.html
  'index.html',
  'history.html',
  // Add other static assets like images, fonts, etc.
  // 'images/logo.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_CACHE_URLS);
      })
  );
});

// Activate event - clean up old caches
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip caching for the live data endpoint (if any)
  // if (event.request.url.includes('/api/live-data')) {
  //   return fetch(event.request);
  // }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // For navigation requests, try the network but fall back to offline page
        if (event.request.mode === 'navigate') {
          return fetch(event.request)
            .catch(() => caches.match(OFFLINE_URL));
        }
        
        // For all other requests, go to network
        return fetch(event.request);
      })
  );
});

// Listen for message events (skipWaiting)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
