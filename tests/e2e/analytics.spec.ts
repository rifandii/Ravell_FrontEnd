import { expect, test, type Page } from '@playwright/test';

const EXPECTED_GA_ID = process.env.E2E_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

test.skip(!EXPECTED_GA_ID, 'Set E2E_GA_MEASUREMENT_ID or NEXT_PUBLIC_GA_MEASUREMENT_ID to validate GA4 page-view ownership.');

test('direct GA4 emits one page-view config for initial, client, and back navigation', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/gtag/js**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.__ravellGtagLoaded = true;',
    });
  });

  await page.goto('/');

  const configEntries = await waitForConfigEntries(page);
  expect(configEntries.some((entry) => entry.name === EXPECTED_GA_ID && entry.payload?.send_page_view === false)).toBe(true);
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
  await expect(page.locator('script[src*="googletagmanager.com/gtm.js"]')).toHaveCount(0);
  await expectPageViewConfigCount(page, 1);

  await page.getByRole('link', { name: 'Articles' }).click();
  await expect(page).toHaveURL(/\/articles$/);
  await expectPageViewConfigCount(page, 2);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expectPageViewConfigCount(page, 3);
});

async function waitForConfigEntries(page: Page) {
  await expect.poll(async () => {
    const entries = await getDataLayerEntries(page);
    return entries.filter((entry) => entry.command === 'config').length;
  }).toBeGreaterThan(0);

  const entries = await getDataLayerEntries(page);
  return entries.filter((entry) => entry.command === 'config');
}

async function expectPageViewConfigCount(page: Page, expectedCount: number) {
  await expect.poll(async () => {
    const entries = await getDataLayerEntries(page);
    return getPageViewConfigEntries(entries).length;
  }).toBe(expectedCount);

  await page.waitForTimeout(300);
  const entries = await getDataLayerEntries(page);
  expect(getPageViewConfigEntries(entries)).toHaveLength(expectedCount);
}

function getPageViewConfigEntries(entries: Awaited<ReturnType<typeof getDataLayerEntries>>) {
  return entries.filter((entry) => {
    return entry.command === 'config'
      && entry.name === EXPECTED_GA_ID
      && entry.payload?.send_page_view !== false
      && typeof entry.payload?.page_path === 'string';
  });
}

async function getDataLayerEntries(page: Page) {
  return page.evaluate(() => {
    const layer = (window as typeof window & { dataLayer?: unknown[] }).dataLayer || [];

    return layer.map((entry) => {
      let args: unknown[] = [];
      if (Array.isArray(entry)) {
        args = entry;
      } else if (entry && typeof entry === 'object' && 'length' in entry) {
        args = Array.from(entry as ArrayLike<unknown>);
      }

      const payload = args[2];
      return {
        command: typeof args[0] === 'string' ? args[0] : '',
        name: typeof args[1] === 'string' ? args[1] : '',
        payload: payload && typeof payload === 'object' ? payload as Record<string, unknown> : undefined,
      };
    });
  });
}
