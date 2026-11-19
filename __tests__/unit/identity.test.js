import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PERSON_ID, jsonLdScript, profilePageJsonLd, siteJsonLd } from '../../src/lib/identity.ts';

// Search engines and AI tools should see Oakar Oo, Kruskal and Mykal-Steele, the
// emails and every profile below as one person.
const node = (type) => siteJsonLd()['@graph'].find((n) => n['@type'] === type);

describe('person structured data', () => {
  test('should give the person a stable id on oakar.dev', () => {
    expect(PERSON_ID).toBe('https://oakar.dev/#person');
    expect(node('Person')['@id']).toBe(PERSON_ID);
    expect(node('Person').url).toBe('https://oakar.dev');
    expect(siteJsonLd()['@context']).toBe('https://schema.org');
  });

  test('should list every name the person goes by', () => {
    const person = node('Person');
    expect(person.name).toBe('Oakar Oo');
    expect(person.alternateName).toEqual(
      expect.arrayContaining(['Kruskal', 'Mykal-Steele', 'OakarOo']),
    );
  });

  test('should list both emails', () => {
    expect(node('Person').email).toEqual(
      expect.arrayContaining(['me@oakar.dev', 'mykal.stele@gmail.com']),
    );
  });

  test('should link every profile as a full https URL', () => {
    const { sameAs } = node('Person');
    expect(sameAs).toEqual(
      expect.arrayContaining([
        'https://github.com/Mykal-Steele',
        'https://www.linkedin.com/in/oakaroo',
        'https://g.dev/oakaroo',
        'https://www.facebook.com/oakarooprofile',
        'https://www.instagram.com/kruskal.oakar',
        'https://x.com/kruskal_oakar',
      ]),
    );
    for (const url of sameAs) expect(url).toMatch(/^https:\/\/[^/]+\.[a-z]+\//);
  });

  test('should say the site belongs to the person', () => {
    const site = node('WebSite');
    expect(site.url).toBe('https://oakar.dev');
    expect(site.publisher).toEqual({ '@id': PERSON_ID });
  });

  test('should mark the home page as the person profile', () => {
    const page = profilePageJsonLd();
    expect(page['@type']).toBe('ProfilePage');
    expect(page.mainEntity).toEqual({ '@id': PERSON_ID });
  });

  // a value holding </script> must not end the tag early
  test('should escape < so the JSON cannot close its script tag', () => {
    expect(jsonLdScript({ a: '</script><script>alert(1)</script>' })).not.toContain('<');
  });
});

describe('root layout', () => {
  test('should put the person data and rel=me links on every page', () => {
    const src = readFileSync('src/app/layout.tsx', 'utf8');
    expect(src).toContain('siteJsonLd()');
    expect(src).toMatch(/rel="me"/);
  });
});

describe('/llms.txt', () => {
  test('should describe the person for AI tools in plain text', async () => {
    const { GET } = await import('../../src/app/llms.txt/route.ts');
    const res = GET();
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    for (const s of [
      '# Oakar Oo',
      'Kruskal',
      'Mykal-Steele',
      'mykal.stele@gmail.com',
      'me@oakar.dev',
      'https://github.com/Mykal-Steele',
      'https://www.linkedin.com/in/oakaroo',
      'https://oakar.dev/projects',
    ]) {
      expect(text).toContain(s);
    }
  });
});
