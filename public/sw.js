// public/sw.js

const CACHE_NAME = 'ravell-cache-v1';
const ASSET_CACHE_NAME = 'ravell-assets-v1';
const IMAGE_CACHE_NAME = 'ravell-images-v1';

// Pre-cache core shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

// Install event: Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== ASSET_CACHE_NAME && cache !== IMAGE_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network interception & caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extensions, local hot reloading, etc.
  if (!url.protocol.startsWith('http')) return;

  // 1. API Requests & HTML Navigate Requests: Network-First
  // This ensures users get the latest articles/updates when online, but can read offline.
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful network responses
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            
            // Also store index.html cache update if navigating
            if (request.mode === 'navigate') {
              const indexCopy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', indexCopy));
            }
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // If it's a page navigation request, serve index.html (SPA Router takes care of the rest)
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
        })
    );
    return;
  }

  // 2. Static Assets (Vite CSS/JS bundle, Google Fonts): Cache-First
  // Since these are versioned/hashed and immutable, we cache them forever once retrieved.
  if (
    url.pathname.includes('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(ASSET_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Images (Django uploaded images, public local images): Stale-While-Revalidate
  // Fast display from cache first, then fetch new/updated images in the background.
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default Strategy: Network-First
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() => caches.match(request))
  );
});

// Listen for skip waiting messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
