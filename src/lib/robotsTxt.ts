import { SITE_URL } from '@/lib/identity';

// Content-Signal is Cloudflare's robots.txt extension (contentsignals.org) that says what
// crawlers may do with the content: show it in search, use it in AI answers, train on it.
const DISALLOW = [
  '/api/',
  '/agent-markdown',
  '/profile',
  '/sendenv',
  '/data-lookup',
  '/rygame',
  '/finance',
  '/hosting',
  '/login',
  '/register',
];

export function robotsTxt() {
  return [
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Allow: /',
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}
