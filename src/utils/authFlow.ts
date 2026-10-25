import { setUser } from '../store/userSlice';
import type { User } from '../types';
import { setAuthTokens } from './tokenStorage';

type SearchParamsLike = {
  get(name: string): string | null;
};

type AuthResponse = {
  user?: unknown;
  token?: string;
  refreshToken?: string;
};

const isUser = (value: unknown): value is User => {
  return typeof value === 'object' && value !== null && '_id' in value && 'username' in value;
};

// Only same-site paths: "//host" and "/\host" are read by browsers as another site.
// Browsers also drop tabs and newlines, so "/\n/host" would become "//host".
const hasControlChar = (text: string) =>
  [...text].some((ch) => ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127);
// Encoded ones (like %0A) are refused too, along with anything that doesn't decode
const decoded = (text: string) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
};
const isSafeRedirect = (path: string) => {
  const plain = decoded(path);
  return (
    plain !== null && /^\/(?![/\\])/.test(path) && !hasControlChar(path) && !hasControlChar(plain)
  );
};

export const getRedirectPaths = (searchParams: SearchParamsLike) => {
  const redirect = searchParams.get('redirect');
  const safe = redirect && isSafeRedirect(redirect) ? redirect : null;

  return {
    from: safe || '/social',
    redirect: safe,
  };
};

export const applyAuthSession = (
  dispatch: (action: unknown) => void,
  response: AuthResponse,
  remember = true,
) => {
  if (!isUser(response?.user) || !response?.token) {
    return false;
  }

  setAuthTokens(response.token, response.refreshToken, remember);
  dispatch(setUser({ user: response.user, token: response.token }));
  return true;
};

// The api/index.ts response interceptor already runs handleApiError once,
// so by the time an error reaches a view's catch block it's already an
// Error/ApiClientError with the real backend message on .message — not a raw
// axios error with .response. Re-running handleApiError here would always
// hit its "no response" branch, since a plain Error has no .response.
export const getAuthErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;
