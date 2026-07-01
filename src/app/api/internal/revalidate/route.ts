import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseContentRevalidationPayload, resolveContentRevalidationTargets } from '../../../../lib/cachePolicy';
import {
  REVALIDATION_SIGNATURE_HEADER,
  REVALIDATION_TIMESTAMP_HEADER,
  verifyRevalidationSignature,
} from '../../../../lib/revalidationAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REVALIDATION_BODY_BYTES = 64 * 1024;
function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function bodySizeResponse() {
  return jsonResponse({ ok: false, error: 'request_body_too_large' }, 413);
}

function hasOversizedContentLength(contentLength: string | null) {
  if (!contentLength) return false;

  const parsedLength = Number(contentLength);
  return Number.isFinite(parsedLength) && parsedLength > MAX_REVALIDATION_BODY_BYTES;
}

function isOversizedBody(body: string) {
  return Buffer.byteLength(body, 'utf8') > MAX_REVALIDATION_BODY_BYTES;
}

function parsePayload(body: string) {
  try {
    return parseContentRevalidationPayload(JSON.parse(body) as unknown);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (hasOversizedContentLength(request.headers.get('content-length'))) {
    return bodySizeResponse();
  }

  const body = await request.text();
  if (isOversizedBody(body)) {
    return bodySizeResponse();
  }

  const authResult = verifyRevalidationSignature({
    secret: process.env.RAVELL_REVALIDATION_SECRET,
    timestamp: request.headers.get(REVALIDATION_TIMESTAMP_HEADER),
    signature: request.headers.get(REVALIDATION_SIGNATURE_HEADER),
    body,
  });

  if (!authResult.ok) {
    return jsonResponse({ ok: false, error: authResult.code }, authResult.status);
  }

  const payload = parsePayload(body);
  if (!payload) {
    return jsonResponse({ ok: false, error: 'invalid_revalidation_payload' }, 400);
  }

  const targets = resolveContentRevalidationTargets(payload);
  if (targets.tags.length === 0 && targets.paths.length === 0) {
    return jsonResponse({ ok: false, error: 'empty_revalidation_target' }, 400);
  }

  for (const tag of targets.tags) {
    revalidateTag(tag, { expire: 0 });
  }

  for (const path of targets.paths) {
    revalidatePath(path);
  }

  return jsonResponse({
    ok: true,
    revalidated: {
      tags: targets.tags.length,
      paths: targets.paths.length,
    },
  });
}
