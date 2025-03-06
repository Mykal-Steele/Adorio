// my api setup file - finally got axios working right
import axios from "axios";

// using this url for my api calls
const apiUrl =
  process.env.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com";

const API = axios.create({
  baseURL: `${apiUrl}/api`, // gotta add /api to the url
  withCredentials: true,
  timeout: 10000, // 10 secs before timeout, server can be slow sometimes
});

// adding token to every request cuz security and stuff
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// fixing up errors so they look nicer to users
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      "An unexpected error occurred. Please try again later.";

    // making errors more user-friendly
    const enhancedError = {
      ...error,
      userMessage: errorMessage,
    };

    // no need to log aborted requests, they're not real errors
    if (error.code !== "ERR_CANCELED" && error.name !== "AbortError") {
      console.error("API Error:", errorMessage, error.config?.url);
    }

    return Promise.reject(enhancedError);
  }
);

// all my user stuff
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

// login function - took me 3 tries to get this right lol
export const login = async (userData) => {
  try {
    const response = await API.post("/users/login", userData);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// gets the current user's profile data
export const fetchUserData = async () => {
  try {
    const response = await API.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// moved all the post api calls to their own file cuz this one was getting huge
export {
  getPosts,
  createPost,
  likePost,
  addComment,
  getSinglePost,
} from "./posts";

export default API;
