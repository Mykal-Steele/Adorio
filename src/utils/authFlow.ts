import { setUser } from '../store/userSlice';
import type { User } from '../types';
import { handleApiError } from './errorHandling';

type SearchParamsLike = {
  get(name: string): string | null;
};

type AuthResponse = {
  user?: unknown;
  token?: string;
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
  dispatch(setUser({ user: response.user, token: response.token }));
  return true;
};

export const getAuthErrorMessage = (error: unknown, fallback: string) =>
  handleApiError(error, fallback).message;
