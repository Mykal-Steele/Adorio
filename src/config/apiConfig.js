// Central place to keep backend URL derivation logic.
const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const resolveBrowserEnv = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.VITE_BACKEND_URL;
};

// Prefer compile-time env vars, fall back to runtime injection, then sensible defaults.
const resolveBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_BACKEND_URL || resolveBrowserEnv();

  if (envUrl) {
    return stripTrailingSlash(envUrl);
  }

  if (typeof window !== 'undefined' && window.location) {
    return stripTrailingSlash(window.location.origin);
  }

  return 'http://localhost:3000';
};

const API_BASE_URL = `${stripTrailingSlash(resolveBaseUrl())}/api`;

// Exported constant keeps axios (and any fetch wrappers) aligned on a single base URL.

export { API_BASE_URL };
