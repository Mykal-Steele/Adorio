// src\api\index.js
import axios from "axios";

// Use process.env to access environment variables in CommonJS
const apiUrl =
  process.env.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com";

const API = axios.create({
  baseURL: `${apiUrl}/api`, // Append /api to the base URL
  withCredentials: true,
  timeout: 10000,
});

// Add token to request headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Add response interceptor for consistent error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      "An unexpected error occurred. Please try again later.";

    // Add user-friendly message to all errors
    const enhancedError = {
      ...error,
      userMessage: errorMessage,
    };

    // Don't log aborted requests as errors
    if (error.code !== "ERR_CANCELED" && error.name !== "AbortError") {
      console.error("API Error:", errorMessage, error.config?.url);
    }

    return Promise.reject(enhancedError);
  }
);

// User-related API calls
export const register = async (userData) => {
  try {
    const response = await API.post("/users/register", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error registering user:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const login = async (userData) => {
  try {
    const response = await API.post("/users/login", userData);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const fetchUserData = async () => {
  try {
    const response = await API.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Post-related API calls (moved to posts.js)
export {
  getPosts,
  createPost,
  likePost,
  addComment,
  getSinglePost,
} from "./posts";

export default API;
