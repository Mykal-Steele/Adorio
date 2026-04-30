import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { isAbortError, handleApiError } from '../utils/errorHandling';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!isAbortError(error) && process.env.NODE_ENV !== 'production') {
      console.error('api error:', error.config?.url, error.response?.status);
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

export const fetchUserData = () => request(API.get('/users/me'));

export const storeSecret = (message, password) =>
  request(API.post('/secretenv', { message, password }));

export { sendContactMessage } from './contact';
export { getPosts, createPost, likePost, addComment, getSinglePost } from './posts';

export default API;
