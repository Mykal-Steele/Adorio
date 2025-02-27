// feelio/src/api/index.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://feelio-github-io.onrender.com/api/", // Replace with your Render backend URL
  withCredentials: true,
  timeout: 10000,
});

// Add token to request headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

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
