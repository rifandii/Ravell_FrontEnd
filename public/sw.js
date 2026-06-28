const STATIC_CACHE_NAME = 'ravell-static-v2';
const LEGACY_CACHE_NAMES = new Set([
  'ravell-cache-v1',
  'ravell-assets-v1',
  'ravell-images-v1',
]);

const RAVELL_CACHE_PREFIX = 'ravell-';
const HASHED_ASSET_PREFIXES = [
  '/_next/static/',
  '/assets/',
];
const API_HOSTNAMES = new Set([
  'api.ravell.tech',
  'api-dev.ravell.tech',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(activateWorker());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (request.mode === 'navigate' || request.destination === 'document') return;
  if (isApiRequest(url)) return;

  if (isFingerprintStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function activateWorker() {
  const cacheNames = await caches.keys();
  const obsoleteCacheNames = cacheNames.filter((cacheName) => {
    const isLegacyCache = LEGACY_CACHE_NAMES.has(cacheName);
    const isOldRavellCache = cacheName.startsWith(RAVELL_CACHE_PREFIX) && cacheName !== STATIC_CACHE_NAME;
    return isLegacyCache || isOldRavellCache;
  });

  await Promise.all(obsoleteCacheNames.map((cacheName) => caches.delete(cacheName)));
  await self.clients.claim();

  if (obsoleteCacheNames.length > 0) {
    await reloadWindowClients();
  }
}

async function reloadWindowClients() {
  const windowClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  await Promise.all(
    windowClients.map((client) => {
      if ('navigate' in client) {
        return client.navigate(client.url).catch(() => undefined);
      }
      return undefined;
    })
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || API_HOSTNAMES.has(url.hostname);
}

function isFingerprintStaticAsset(url) {
  return url.origin === self.location.origin
    && HASHED_ASSET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}
