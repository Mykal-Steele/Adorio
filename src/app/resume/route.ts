import { createR2Proxy } from '@/lib/r2Proxy';

// The PDF lives in the adorio-resume R2 bucket, served at resume.adorio.space.
// To update it: npx wrangler r2 object put adorio-resume/Oakar-Oo-Resume.pdf --remote \
//   --file <pdf> --content-type application/pdf --cache-control no-cache
const RESUME_URL = process.env.RESUME_URL || 'https://resume.adorio.space/Oakar-Oo-Resume.pdf';

// Run on every visit so a new upload shows up right away
export const dynamic = 'force-dynamic';

export const GET = createR2Proxy(RESUME_URL, {
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'inline; filename="Oakar-Oo-Resume.pdf"',
});
