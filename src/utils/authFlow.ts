import { setUser } from '../store/userSlice';
import type { User } from '../types';

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

export const getRedirectPaths = (searchParams: SearchParamsLike) => {
  const redirect = searchParams.get('redirect');

  return {
    from: redirect || '/social',
    redirect,
  };
};

export const applyAuthSession = (dispatch: (action: unknown) => void, response: AuthResponse) => {
  if (!isUser(response?.user) || !response?.token) {
    return false;
  }

  localStorage.setItem('token', response.token);
  if (response.refreshToken) {
    localStorage.setItem('refreshToken', response.refreshToken);
  }
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
