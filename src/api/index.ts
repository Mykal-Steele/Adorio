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

// The 15 min access token can expire mid-session. Before, every request then failed with
// 401/403 until a reload re-ran the refresh in useAuthBootstrap. Now it refreshes once
// (shared by every request that fails at the same moment, so a burst only hits the
// refresh endpoint once) and retries the original request.
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

export const storeSecret = (
  name: string,
  message: string,
  password: string,
): Promise<{ name?: string; retrievalCommand: string }> =>
  request(API.post('/secretenv', { name, message, password }));

export { sendContactMessage } from './contact';
export { runCodingSubmission, requestCodeRunnerSession, holdCodeRunner } from './coding';
export type { CodeRunnerState, CodeRunnerStatus } from './coding';
export { getPosts, createPost, likePost, addComment, getSinglePost } from './posts';
export {
  presignHostedUpload,
  confirmHostedUpload,
  getMyHostedFiles,
  getHostedUsage,
  deleteHostedFile,
  getAllHostedFilesAdmin,
} from './hosting';
export {
  getFinanceOverview,
  getFinanceSettings,
  updateFinanceSettings,
  getFinanceCategories,
  createFinanceCategory,
  updateFinanceCategory,
  deleteFinanceCategory,
  getFinanceTransactions,
  createFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction,
} from './finance';
export type {
  FinanceCategory,
  FinanceTransaction,
  FinanceSettings,
  FinanceOverview,
  FinanceTransactionsPage,
  FinanceTransactionsQuery,
  TransactionType,
} from './finance';

export default API;
