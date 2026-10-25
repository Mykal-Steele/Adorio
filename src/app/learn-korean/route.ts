import { createR2Proxy } from '@/lib/r2Proxy';

// The page lives in the adorio-hosted R2 bucket, served at files.adorio.space.
// To update it: npx wrangler r2 object put adorio-hosted/learn-korean.html --remote \
//   --file <html> --content-type "text/html; charset=utf-8" --cache-control no-cache
const PAGE_URL = 'https://files.adorio.space/learn-korean.html';

// Run on every visit so a new upload shows up right away
export const dynamic = 'force-dynamic';

export const GET = createR2Proxy(PAGE_URL, { 'Content-Type': 'text/html; charset=utf-8' });
