// my api setup file - finally got axios working right
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { isAbortError, handleApiError } from '../utils/errorHandling';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// adding token to every request cuz security and stuff
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// simplified this cuz it was doing too much duplicate stuff
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // no need to log aborted requests, they're not real errors
    if (!isAbortError(error) && process.env.NODE_ENV !== 'production') {
      console.error('api error:', error.config?.url, error.response?.status);
    }

    return Promise.reject(error);
  }
);

// all my user stuff
export const register = async (userData) => {
  try {
    const response = await API.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'registration failed');
  }
};

// login function - took me 3 tries to get this right lol
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

// Store a secret message
export const storeSecret = async (message, password) => {
  try {
    const response = await API.post('/secretenv', { message, password });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to store secret');
  }
};

// moved all the post api calls to their own file cuz this one was getting huge
export {
  getPosts,
  createPost,
  likePost,
  addComment,
  getSinglePost,
} from './posts';

export default API;
