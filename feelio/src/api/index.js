import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Add token to request headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register = async (userData) => {
  const response = await API.post("/users/register", userData);
  return response.data;
};

export const fetchUserData = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const login = async (userData) => {
  const response = await API.post("/users/login", userData);
  return response.data;
};

export const getPosts = async () => {
  const response = await API.get("/posts");
  return response.data;
};
export const getSinglePost = async (id) => {
  const response = await API.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await API.post("/posts", postData);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await API.put(`/posts/${postId}/like`);
  return response.data;
};

// In api.js
export const addComment = async (postId, commentText) => {
  const response = await API.post(`/posts/${postId}/comment`, {
    text: commentText,
  });
  return response.data;
};
