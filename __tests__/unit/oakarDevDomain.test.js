import { afterEach, describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import worker from '../../cloudflare-worker/domain-redirect/index.js';

// The site moved from adorio.space to oakar.dev. Every old address has to land on the
// same page at the new one, so links, bookmarks and search results keep working.
describe('domain redirect worker', () => {
  const visit = (url, method = 'GET') => worker.fetch(new Request(url, { method }));

  test.each([
    ['https://adorio.space/', 'https://oakar.dev/'],
    ['https://adorio.space/projects/adorio?tab=1', 'https://oakar.dev/projects/adorio?tab=1'],
    ['http://adorio.space/social', 'https://oakar.dev/social'],
    ['https://www.adorio.space/coding', 'https://oakar.dev/coding'],
    ['https://files.adorio.space/h/a.pdf', 'https://files.oakar.dev/h/a.pdf'],
    [
      'https://resume.adorio.space/Oakar-Oo-Resume.pdf',
      'https://resume.oakar.dev/Oakar-Oo-Resume.pdf',
    ],
    ['https://env.adorio.space/', 'https://env.oakar.dev/'],
    ['https://www.oakar.dev/contact', 'https://oakar.dev/contact'],
  ])('should send %s to %s for good', async (from, to) => {
    const res = await visit(from);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe(to);
  });

  // a 301 lets browsers turn a POST into a GET, which would drop the body
  test('should keep the method for a POST', async () => {
    const res = await visit('https://adorio.space/api/contact', 'POST');
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://oakar.dev/api/contact');
  });

  // there is nothing on oakar.dev for a subdomain this list doesn't know
  test('should send an unknown adorio.space subdomain to the home page', async () => {
    const res = await visit('https://old.adorio.space/whatever');
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://oakar.dev/');
  });
});

describe('backend CORS origins', () => {
  test('should allow oakar.dev and still allow adorio.space', async () => {
    const { allowedOrigins } = await import('../../backend/config/environment.js');
    expect(allowedOrigins).toContain('https://oakar.dev');
    expect(allowedOrigins).toContain('https://adorio.space');
  });
});

describe('env install script', () => {
  test('should call the API on oakar.dev by default', () => {
    const script = readFileSync('cloudflare-worker/env-script/script.sh', 'utf8');
    expect(script).toContain("api='https://oakar.dev/api/secretenv'");
  });
});

describe('site name', () => {
  // oakar.dev is a personal site, so its pages carry my name; the apps keep Adorio
  test('should name the site after me and keep Adorio for the apps', async () => {
    const root = readFileSync('src/app/layout.tsx', 'utf8');
    expect(root).toContain("siteName: 'Oakar Oo'");
    expect(root).toContain("template: '%s | Oakar Oo'");
    expect(root).toContain("new URL('https://oakar.dev')");
    const apps = readFileSync('src/app/(with-navbar)/layout.tsx', 'utf8');
    expect(apps).toContain("template: '%s | Adorio'");
  });
});

describe('page titles', () => {
  // these titles already end in "| Oakar Oo", so the layout template must not add it again
  test.each([
    'src/app/(public)/page.tsx',
    'src/app/(public)/projects/page.tsx',
    'src/app/(public)/contact/page.tsx',
    'src/app/(public)/certificates/page.tsx',
    'src/app/(public)/projects/[id]/page.tsx',
    'src/app/(public)/skills/[id]/page.tsx',
    'src/app/(public)/certificates/[id]/page.tsx',
  ])('should not add the site name twice on %s', (file) => {
    expect(readFileSync(file, 'utf8')).toMatch(/^ {2,4}title: \{ absolute: /m);
  });
});

describe('/api/contact', () => {
  const sent = [];
  let reply = { data: { id: 'x' }, error: null };
  mock.module('resend', () => ({
    Resend: class {
      emails = {
        send: async (msg) => {
          sent.push(msg);
          return reply;
        },
      };
    },
  }));

  afterEach(() => {
    sent.length = 0;
    reply = { data: { id: 'x' }, error: null };
  });

  let n = 0;
  const post = async () => {
    const { POST } = await import(`../../src/app/api/contact/route.ts?case=${n++}`);
    return POST(
      new Request('https://oakar.dev/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${n}` },
        body: JSON.stringify({
          name: 'Visitor',
          email: 'visitor@example.com',
          subject: 'Hello',
          message: 'A message long enough to pass the schema check.',
        }),
      }),
    );
  };

  test('should send from oakar.dev to me@oakar.dev', async () => {
    const res = await post();
    expect(res.status).toBe(200);
    expect(sent[0].from).toContain('<noreply@oakar.dev>');
    expect(sent[0].to).toBe('me@oakar.dev');
    expect(sent[0].html).not.toMatch(/adorio\.space/i);
  });

  // Resend reports a rejected message (bad key, unverified sender) in the result
  // instead of throwing, so the visitor was told it was sent when it wasn't
  test('should fail when Resend rejects the message', async () => {
    reply = { data: null, error: { statusCode: 403, message: 'not authorized' } };
    const res = await post();
    expect(res.status).toBe(500);
  });
});
