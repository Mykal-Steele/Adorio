import { setAuthTokens, clearAuthTokens } from '../../src/utils/tokenStorage.ts';

const memoryStorage = () => {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
  };
};

beforeEach(() => {
  globalThis.localStorage = memoryStorage();
  globalThis.sessionStorage = memoryStorage();
  globalThis.document = { documentElement: { dataset: {} } };
});

// The head script in layout.tsx reads the same flag on the next load, so the
// signed-in version paints first. These keep it true for the current page too.
describe('auth flag on <html>', () => {
  test('should mark the page signed in when tokens are saved', () => {
    setAuthTokens('access', 'refresh', true);
    expect(document.documentElement.dataset.auth).toBe('in');
  });

  test('should mark it for a session-only login too', () => {
    setAuthTokens('access', undefined, false);
    expect(document.documentElement.dataset.auth).toBe('in');
  });

  test('should clear the flag on sign out', () => {
    setAuthTokens('access', 'refresh', true);
    clearAuthTokens();
    expect(document.documentElement.dataset.auth).toBeUndefined();
  });
});
