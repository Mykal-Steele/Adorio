import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { handleApiError } from '../utils/errorHandling';
import { getToken, getRefreshToken, setToken, clearAuthTokens } from '../utils/tokenStorage';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = getToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// The 15-min access token expiring mid-session used to just fail every
// request with a raw 401/403 until a full page reload re-ran the one-time
// refresh in useAuthBootstrap. This catches that here instead: refresh once
// (shared across any requests that fail at the same moment, so a burst of
// expired-token failures doesn't fire the refresh endpoint more than once)
// and retry the original request with the new token.
let refreshPromise: Promise<string> | null = null;

const AUTH_ENDPOINTS = ['/users/login', '/users/register', '/users/refresh-token'];

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => originalRequest?.url?.includes(path));

    if ((status === 401 || status === 403) && !originalRequest?._retried && !isAuthEndpoint) {
      const storedRefreshToken = getRefreshToken();
      if (storedRefreshToken) {
        originalRequest._retried = true;
        try {
          if (!refreshPromise) {
            refreshPromise = request(
              API.post('/users/refresh-token', { refreshToken: storedRefreshToken }),
            )
              .then(({ token }) => {
                setToken(token);
                return token;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        } catch {
          clearAuthTokens();
        }
      }
    }

    return Promise.reject(handleApiError(error));
  },
);

// Wrapper extracts data, interceptor handles errors
export const request = async (axiosCall) => {
  const response = await axiosCall;
  return response.data;
};

export const register = (userData) => request(API.post('/users/register', userData));

export const login = (userData) => request(API.post('/users/login', userData));

export const refreshAccessToken = (refreshToken: string): Promise<{ token: string }> =>
  request(API.post('/users/refresh-token', { refreshToken }));

export const fetchUserData = () => request(API.get('/users/me'));

export const storeSecret = (message, password) =>
  request(API.post('/secretenv', { message, password }));

export { sendContactMessage } from './contact';
export { runCodingSubmission } from './coding';
export { getPosts, createPost, likePost, addComment, getSinglePost } from './posts';
export {
  uploadHostedFile,
  getMyHostedFiles,
  deleteHostedFile,
  getAllHostedFilesAdmin,
} from './hosting';

export default API;
