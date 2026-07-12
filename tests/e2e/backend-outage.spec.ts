import { expect, test } from '@playwright/test';

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json',
};

const emptyArticles = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

test('shows unavailable content instead of an empty article result on API outage', async ({ page }) => {
  await page.route('**/api/articles/**', async (route) => {
    await route.fulfill({ status: 503, headers: jsonHeaders, body: '{}' });
  });

  await page.goto('/articles');

  await expect(page.getByRole('heading', { name: 'Content Temporarily Unavailable' })).toBeVisible();
  await expect(page.getByText('No articles found')).toHaveCount(0);
});

test('keeps a successful empty article response as a valid empty state', async ({ page }) => {
  await page.route('**/api/articles/**', async (route) => {
    await route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify(emptyArticles) });
  });

  await page.goto('/articles');

  await expect(page.getByText('No articles found')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Content Temporarily Unavailable' })).toHaveCount(0);
});

test('keeps a genuine tag 404 as an invalid-filter state', async ({ page }) => {
  await page.route('**/api/articles/**', async (route) => {
    await route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify(emptyArticles) });
  });
  await page.route('**/api/tags/missing-tag/**', async (route) => {
    await route.fulfill({ status: 404, headers: jsonHeaders, body: '{}' });
  });

  await page.goto('/articles?tags__slug=missing-tag');

  await expect(page.getByRole('heading', { name: 'Invalid Filter' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Content Temporarily Unavailable' })).toHaveCount(0);
});

test('shows unavailable content when tag validation has a backend outage', async ({ page }) => {
  await page.route('**/api/articles/**', async (route) => {
    await route.fulfill({ status: 200, headers: jsonHeaders, body: JSON.stringify(emptyArticles) });
  });
  await page.route('**/api/tags/unavailable-tag/**', async (route) => {
    await route.fulfill({ status: 503, headers: jsonHeaders, body: '{}' });
  });

  await page.goto('/articles?tags__slug=unavailable-tag');

  await expect(page.getByRole('heading', { name: 'Content Temporarily Unavailable' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Invalid Filter' })).toHaveCount(0);
  await expect(page.getByText('No articles found')).toHaveCount(0);
});
