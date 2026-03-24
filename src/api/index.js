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

    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await API.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'registration failed');
  }
};

export const login = async (userData) => {
  try {
    const response = await API.post('/users/login', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'login failed');
  }
};

// gets the current user's profile data
export const fetchUserData = async () => {
  try {
    const response = await API.get('/users/me');
    return response.data;
  } catch (error) {
    const customMessage =
      process.env.NODE_ENV !== 'production'
        ? 'failed to fetch user data'
        : null;
    throw handleApiError(error, customMessage);
  }
};

export const storeSecret = async (message, password) => {
  try {
    const response = await API.post('/secretenv', { message, password });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to store secret');
  }
};

export {
  getPosts,
  createPost,
  likePost,
  addComment,
  getSinglePost,
} from './posts';

export default API;
