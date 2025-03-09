// my api setup file - finally got axios working right
import axios from "axios";
import { isAbortError, handleApiError } from "../utils/errorHandling";

// figuring out if we're in the browser or not so we can get the url right
// spent way too long debugging this stupid issue
export const getApiUrl = () => {
  return typeof window !== "undefined"
    ? window.VITE_BACKEND_URL + "/api/"
    : "https://feelio-github-io.onrender.com/api/";
};

// create your API instance
const API = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000, // 15 sec timeout
});

// adding token to every request cuz security and stuff
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// simplified this cuz it was doing too much duplicate stuff
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // no need to log aborted requests, they're not real errors
    if (!isAbortError(error)) {
      if (process.env.NODE_ENV !== "production") {
        console.error("api error:", error.config?.url, error.response?.status);
      }
    }

    return Promise.reject(error); // pass unmodified so handleApiError gets original error
  }
);

// all my user stuff
export const register = async (userData) => {
  try {
    const response = await API.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "registration failed");
  }
};

// login function - took me 3 tries to get this right lol
export const login = async (userData) => {
  try {
    const response = await API.post("/users/login", userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "login failed");
  }
};

// gets the current user's profile data
export const fetchUserData = async () => {
  try {
    const response = await API.get("/users/me");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "failed to fetch user data");
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
