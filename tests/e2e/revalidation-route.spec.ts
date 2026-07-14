import { createHmac } from 'node:crypto';
import { expect, test } from '@playwright/test';

const secret = process.env.RAVELL_REVALIDATION_SECRET;

function timestamp(offsetSeconds = 0) {
  return String(Math.floor(Date.now() / 1000) + offsetSeconds);
}

function sign(body: string, selectedTimestamp: string) {
  if (!secret) throw new Error('RAVELL_REVALIDATION_SECRET is required for this test');
  return createHmac('sha256', secret).update(`${selectedTimestamp}.${body}`).digest('hex');
}

async function expectNoSecretLeak(responseText: string) {
  if (secret) expect(responseText).not.toContain(secret);
}

test.describe('internal content revalidation route', () => {
  test.skip(!secret, 'RAVELL_REVALIDATION_SECRET is required for authenticated revalidation tests');

  test('rejects missing authentication', async ({ request }) => {
    const body = JSON.stringify({ model: 'article', action: 'updated', slugs: ['sample-article'] });
    const response = await request.post('/api/internal/revalidate', {
      data: body,
      headers: { 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(401);
    expect(response.headers()['cache-control']).toContain('no-store');
    await expectNoSecretLeak(await response.text());
  });

  test('rejects oversized request body before authentication', async ({ request }) => {
    const body = 'x'.repeat(64 * 1024 + 1);
    const response = await request.post('/api/internal/revalidate', {
      data: body,
      headers: { 'content-type': 'text/plain' },
    });

    expect(response.status()).toBe(413);
    expect(response.headers()['cache-control']).toContain('no-store');
    const text = await response.text();
    await expectNoSecretLeak(text);
    expect(JSON.parse(text)).toMatchObject({ ok: false, error: 'request_body_too_large' });
  });
  test('rejects invalid authentication', async ({ request }) => {
    const body = JSON.stringify({ model: 'article', action: 'updated', slugs: ['sample-article'] });
    const response = await request.post('/api/internal/revalidate', {
      data: body,
      headers: {
        'content-type': 'application/json',
        'x-ravell-timestamp': timestamp(),
        'x-ravell-signature': '0'.repeat(64),
      },
    });

    expect(response.status()).toBe(401);
    expect(response.headers()['cache-control']).toContain('no-store');
    await expectNoSecretLeak(await response.text());
  });

  test('rejects stale replay-window timestamps', async ({ request }) => {
    const body = JSON.stringify({ model: 'article', action: 'updated', slugs: ['sample-article'] });
    const staleTimestamp = timestamp(-600);
    const response = await request.post('/api/internal/revalidate', {
      data: body,
      headers: {
        'content-type': 'application/json',
        'x-ravell-timestamp': staleTimestamp,
        'x-ravell-signature': sign(body, staleTimestamp),
      },
    });

    expect(response.status()).toBe(401);
    expect(response.headers()['cache-control']).toContain('no-store');
    const payload = await response.json();
    expect(payload).toMatchObject({ ok: false, error: 'stale_revalidation_request' });
  });

  test('rejects signed malformed array fields', async ({ request }) => {
    const malformedPayloads = [
      { model: 'article', action: 'updated', slugs: 'not-an-array' },
      { model: 'article', action: 'updated', tags: 'not-an-array' },
      { model: 'article', action: 'updated', paths: 'not-an-array' },
    ];

    for (const payload of malformedPayloads) {
      const body = JSON.stringify(payload);
      const selectedTimestamp = timestamp();
      const response = await request.post('/api/internal/revalidate', {
        data: body,
        headers: {
          'content-type': 'application/json',
          'x-ravell-timestamp': selectedTimestamp,
          'x-ravell-signature': sign(body, selectedTimestamp),
        },
      });

      expect(response.status()).toBe(400);
      expect(response.headers()['cache-control']).toContain('no-store');
      const text = await response.text();
      await expectNoSecretLeak(text);
      expect(JSON.parse(text)).toMatchObject({ ok: false, error: 'invalid_revalidation_payload' });
    }
  });
  test('rejects signed invalid slug tag and path values', async ({ request }) => {
    const invalidPayloads = [
      { model: 'article', action: 'updated', slugs: ['../invalid'] },
      { model: 'article', action: 'updated', tags: ['invalid-tag'] },
      { model: 'article', action: 'updated', paths: ['/unexpected-path'] },
    ];

    for (const payload of invalidPayloads) {
      const body = JSON.stringify(payload);
      const selectedTimestamp = timestamp();
      const response = await request.post('/api/internal/revalidate', {
        data: body,
        headers: {
          'content-type': 'application/json',
          'x-ravell-timestamp': selectedTimestamp,
          'x-ravell-signature': sign(body, selectedTimestamp),
        },
      });

      expect(response.status()).toBe(400);
      expect(response.headers()['cache-control']).toContain('no-store');
      const text = await response.text();
      await expectNoSecretLeak(text);
      expect(JSON.parse(text)).toMatchObject({ ok: false, error: 'invalid_revalidation_payload' });
    }
  });
  test('accepts a valid signed request and reports sanitized target counts', async ({ request }) => {
    const body = JSON.stringify({ model: 'article', action: 'updated', slugs: ['sample-article'] });
    const selectedTimestamp = timestamp();
    const response = await request.post('/api/internal/revalidate', {
      data: body,
      headers: {
        'content-type': 'application/json',
        'x-ravell-timestamp': selectedTimestamp,
        'x-ravell-signature': sign(body, selectedTimestamp),
      },
    });

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['cache-control']).toContain('no-store');
    const text = await response.text();
    await expectNoSecretLeak(text);
    const payload = JSON.parse(text);
    expect(payload).toMatchObject({ ok: true });
    expect(payload.revalidated.tags).toBeGreaterThan(0);
    expect(payload.revalidated.paths).toBeGreaterThan(0);
    expect(text).not.toContain('sample-article');
  });
});
