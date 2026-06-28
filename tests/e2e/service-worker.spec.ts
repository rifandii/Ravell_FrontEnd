import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const ARTICLE_PATH = process.env.E2E_ARTICLE_PATH || '/articles/deploying-ipsec-site-to-site-vpns-with-ftd';
const STATIC_CACHE_NAME = 'ravell-static-v2';
const OTHER_FEATURE_CACHE_NAME = 'ravell-other-feature-v1';
const LEGACY_CACHE_NAMES = ['ravell-cache-v1', 'ravell-assets-v1', 'ravell-images-v1'];
const LEGACY_SPA_HTML = '<!doctype html><html><body><div id="root" data-testid="legacy-spa-shell">Legacy SPA shell</div><script type="module" src="/src/main.tsx"></script></body></html>';

test('registers the current service worker on a fresh production visit', async ({ page }) => {
  await page.goto('/');

  const scriptURL = await waitForActiveServiceWorker(page);
  expect(scriptURL).toContain('/sw.js');

  const cacheNames = await getCacheNames(page);
  for (const cacheName of LEGACY_CACHE_NAMES) {
    expect(cacheNames).not.toContain(cacheName);
  }
});

test('cleans only owned caches and does not serve article routes from index.html', async ({ context, page }) => {
  await installLegacyWorkerRoute(context);
  await page.goto('/');

  await waitForActiveServiceWorker(page);
  await seedOtherFeatureCache(page);

  let cacheNames = await getCacheNames(page);
  expect(cacheNames).toEqual(expect.arrayContaining(LEGACY_CACHE_NAMES));
  expect(cacheNames).toContain(OTHER_FEATURE_CACHE_NAME);

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  });

  await context.unrouteAll({ behavior: 'wait' });
  await expectCurrentWorkerSource(page);
  await page.close();

  const migratedPage = await context.newPage();
  await migratedPage.goto('/', { waitUntil: 'load' });
  await waitForActiveServiceWorker(migratedPage);
  await waitForServiceWorkerController(migratedPage);

  await migratedPage.waitForFunction(async (legacyNames) => {
    const names = await caches.keys();
    return !names.some((name) => legacyNames.includes(name));
  }, LEGACY_CACHE_NAMES);

  cacheNames = await getCacheNames(migratedPage);
  for (const cacheName of LEGACY_CACHE_NAMES) {
    expect(cacheNames).not.toContain(cacheName);
  }
  expect(cacheNames).toContain(OTHER_FEATURE_CACHE_NAME);
  expect(await cacheHasRequest(migratedPage, OTHER_FEATURE_CACHE_NAME, '/other-feature.txt')).toBe(true);

  await migratedPage.waitForTimeout(1000);
  expect(await getNavigationType(migratedPage)).not.toBe('reload');

  await verifyStaticAssetCacheScope(context, migratedPage);

  const response = await migratedPage.goto(ARTICLE_PATH, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);

  const html = await response!.text();
  expect(html).not.toContain('data-testid="legacy-spa-shell"');
  expect(html).not.toContain('src="/src/main.tsx"');

  await expect(migratedPage.locator('main article').first()).toBeVisible();
  await expectArticleNavigationFailsOffline(context, migratedPage);
});

async function installLegacyWorkerRoute(context: BrowserContext) {
  await context.route('**/sw.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      headers: {
        'Cache-Control': 'no-store',
      },
      body: `
const CACHE_NAME = 'ravell-cache-v1';
const ASSET_CACHE_NAME = 'ravell-assets-v1';
const IMAGE_CACHE_NAME = 'ravell-images-v1';
const LEGACY_SPA_HTML = ${JSON.stringify(LEGACY_SPA_HTML)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', new Response(LEGACY_SPA_HTML, { headers: { 'Content-Type': 'text/html' } }))),
    caches.open(ASSET_CACHE_NAME),
    caches.open(IMAGE_CACHE_NAME),
  ]));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.mode === 'navigate') {
    event.respondWith(caches.match('/index.html'));
  }
});
`,
    });
  });
}

async function waitForActiveServiceWorker(page: Page) {
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active?.scriptURL.endsWith('/sw.js'));
  });

  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL || '';
  });
}

async function waitForServiceWorkerController(page: Page) {
  await page.waitForFunction(() => {
    return Boolean(navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'));
  });
}

async function getCacheNames(page: Page) {
  return page.evaluate(async () => caches.keys());
}

async function getNavigationType(page: Page) {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return navigation?.type || 'unknown';
  });
}

async function seedOtherFeatureCache(page: Page) {
  await page.evaluate(async (cacheName) => {
    const cache = await caches.open(cacheName);
    await cache.put('/other-feature.txt', new Response('keep this cache', {
      headers: { 'Content-Type': 'text/plain' },
    }));
  }, OTHER_FEATURE_CACHE_NAME);
}

async function cacheHasRequest(page: Page, cacheName: string, path: string) {
  return page.evaluate(async ({ cacheName, path }) => {
    const cache = await caches.open(cacheName);
    return Boolean(await cache.match(path));
  }, { cacheName, path });
}

async function expectCurrentWorkerSource(page: Page) {
  const workerSource = await page.evaluate(async () => {
    const response = await fetch('/sw.js', { cache: 'no-store' });
    return response.text();
  });

  expect(workerSource).toContain('ravell-static-v2');
  expect(workerSource).toContain('ravell-static-');
  expect(workerSource).not.toContain('RAVELL_CACHE_PREFIX');
  expect(workerSource).not.toContain("'/assets/'");
  expect(workerSource).not.toContain('client.navigate');
  expect(workerSource).not.toContain('Legacy SPA shell');
}

async function verifyStaticAssetCacheScope(context: BrowserContext, page: Page) {
  const nextStaticPath = await page.evaluate(() => {
    const urls = [
      ...Array.from(document.scripts, (script) => script.src),
      ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[href]'), (link) => link.href),
    ];

    return urls
      .filter(Boolean)
      .map((url) => new URL(url, location.origin).pathname)
      .find((path) => path.startsWith('/_next/static/')) || null;
  });
  expect(nextStaticPath).toBeTruthy();

  const assetProbePath = `/assets/cache-policy-probe-${Date.now()}.js`;
  await context.route(`**${assetProbePath}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.__cachePolicyProbe = true;',
    });
  });

  await page.evaluate(async ({ nextStaticPath, assetProbePath }) => {
    await fetch(nextStaticPath!, { cache: 'reload' });
    await fetch(assetProbePath, { cache: 'reload' }).catch(() => undefined);
  }, { nextStaticPath, assetProbePath });

  const cachedPaths = await page.evaluate(async (cacheName) => {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    return requests.map((request) => new URL(request.url).pathname);
  }, STATIC_CACHE_NAME);

  expect(cachedPaths.some((path) => path.startsWith('/_next/static/'))).toBe(true);
  expect(cachedPaths.some((path) => path.startsWith('/assets/'))).toBe(false);
}

async function expectArticleNavigationFailsOffline(context: BrowserContext, page: Page) {
  await context.setOffline(true);
  try {
    const offlinePath = `${ARTICLE_PATH}?offline-check=${Date.now()}`;
    const result = await page.goto(offlinePath, {
      waitUntil: 'domcontentloaded',
      timeout: 10_000,
    }).then(async () => ({
      reachedDocument: true,
      html: await page.content(),
    })).catch((error) => ({
      reachedDocument: false,
      message: error instanceof Error ? error.message : String(error),
    }));

    expect(result.reachedDocument).toBe(false);
    if ('html' in result) {
      expect(result.html).not.toContain('data-testid="legacy-spa-shell"');
      expect(result.html).not.toContain('src="/src/main.tsx"');
    }
  } finally {
    await context.setOffline(false);
  }
}
