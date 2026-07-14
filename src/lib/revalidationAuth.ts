import { createHmac, timingSafeEqual } from 'node:crypto';

export const REVALIDATION_TIMESTAMP_HEADER = 'x-ravell-timestamp';
export const REVALIDATION_SIGNATURE_HEADER = 'x-ravell-signature';

const MAX_REVALIDATION_CLOCK_SKEW_SECONDS = 300;
const HMAC_SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i;

export type RevalidationAuthResult =
  | { ok: true }
  | { ok: false; status: number; code: string };

export function createRevalidationSignature(secret: string, timestamp: string, body: string) {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
}

function safeCompareHex(actual: string, expected: string) {
  if (!HMAC_SHA256_HEX_PATTERN.test(actual) || !HMAC_SHA256_HEX_PATTERN.test(expected)) {
    return false;
  }

  const actualBuffer = Buffer.from(actual, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

interface VerifyRevalidationSignatureInput {
  secret?: string;
  timestamp?: string | null;
  signature?: string | null;
  body: string;
  nowMs?: number;
}

export function verifyRevalidationSignature({
  secret,
  timestamp,
  signature,
  body,
  nowMs = Date.now(),
}: VerifyRevalidationSignatureInput): RevalidationAuthResult {
  if (!secret) {
    return { ok: false, status: 503, code: 'revalidation_unavailable' };
  }

  if (!timestamp || !signature) {
    return { ok: false, status: 401, code: 'invalid_revalidation_auth' };
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isInteger(timestampSeconds)) {
    return { ok: false, status: 401, code: 'invalid_revalidation_auth' };
  }

  const nowSeconds = Math.floor(nowMs / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > MAX_REVALIDATION_CLOCK_SKEW_SECONDS) {
    return { ok: false, status: 401, code: 'stale_revalidation_request' };
  }

  const expectedSignature = createRevalidationSignature(secret, timestamp, body);
  if (!safeCompareHex(signature, expectedSignature)) {
    return { ok: false, status: 401, code: 'invalid_revalidation_auth' };
  }

  return { ok: true };
}
