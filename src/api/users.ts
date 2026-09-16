import API, { request } from './index';

export { fetchUserData } from './index';

export const searchUsers = (query: string, signal?: AbortSignal) =>
  request(
    API.get(`/users/search?q=${encodeURIComponent(query)}`, {
      signal,
      timeout: 8000,
    }),
  );
