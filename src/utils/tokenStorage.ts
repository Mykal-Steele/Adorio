// Auth tokens live in localStorage (persistent) or sessionStorage (cleared when
// the tab closes), depending on whether the user checked "keep me signed in"
// at login. The choice itself is recorded in localStorage so every reader
// knows which storage to check — sessionStorage can't hold that flag across
// a closed tab, and localStorage is a safe place to remember a boolean.
const REMEMBER_KEY = 'auth_remember';

const rememberChoice = (): boolean => {
  const stored = localStorage.getItem(REMEMBER_KEY);
  // No stored preference (e.g. an existing session from before this feature
  // existed) — keep the old always-persistent behavior.
  return stored === null ? true : stored === 'true';
};

const activeStorage = () => (rememberChoice() ? localStorage : sessionStorage);

export const getToken = (): string | null => activeStorage().getItem('token');

export const getRefreshToken = (): string | null => activeStorage().getItem('refreshToken');

export const setAuthTokens = (
  token: string,
  refreshToken: string | undefined,
  remember: boolean,
) => {
  localStorage.setItem(REMEMBER_KEY, String(remember));
  const store = remember ? localStorage : sessionStorage;
  store.setItem('token', token);
  if (refreshToken) store.setItem('refreshToken', refreshToken);
};

// For refreshing just the access token in place (same storage as the original login).
export const setToken = (token: string) => {
  activeStorage().setItem('token', token);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
};
