import { publicSyndicationResponse } from '../../lib/publicSyndication';

export const runtime = 'nodejs';

export async function GET() {
  return publicSyndicationResponse('rss');
}
