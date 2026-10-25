import { getRedirectPaths } from '../../src/utils/authFlow.ts';

const params = (redirect) => ({
  get: (name) => (name === 'redirect' ? redirect : null),
});

describe('getRedirectPaths', () => {
  test('should send the user back to the page they came from', () => {
    expect(getRedirectPaths(params('/rygame')).from).toBe('/rygame');
    expect(getRedirectPaths(params('/finance?tab=1')).from).toBe('/finance?tab=1');
  });

  test('should fall back to /social when there is no redirect', () => {
    expect(getRedirectPaths(params(null)).from).toBe('/social');
  });

  test('should refuse to send the user to another site after login', () => {
    for (const target of [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'javascript:alert(1)',
      'evil.example/path',
      // Browsers strip tabs and newlines from URLs, which turns these into //evil.example
      '/\n/evil.example',
      '/\t/evil.example',
      '/\r\n/evil.example',
      // The same characters, still percent-encoded after the query string is decoded
      '/%0A/evil.example',
      '/%09/evil.example',
    ]) {
      expect(getRedirectPaths(params(target)).from).toBe('/social');
    }
  });
});
