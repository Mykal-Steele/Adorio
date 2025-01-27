import axios from "axios";

// Set up the Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000", // Adjust the URL if your backend runs on a different port or domain
});

// Register API call
export const register = async (userData) => {
  try {
    const response = await API.post("/api/auth/register", userData);
    return response.data; // Return the data if successful
  } catch (error) {
    console.error(
      "Error registering user:",
      error.response?.data || error.message
    );
    throw error; // Throw error so it can be handled in the component
  }
};

// Login API call
export const login = async (userData) => {
  try {
    const response = await API.post("/api/auth/login", userData);
    return response.data; // Return the data if successful
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    throw error; // Throw error so it can be handled in the component
  }
};

// Get all posts (this can be used in Home.jsx for example)
export const getPosts = async () => {
  try {
    const response = await API.get("/api/posts");
    return response.data; // Return the posts data if successful
  } catch (error) {
    console.error(
      "Error fetching posts:",
      error.response?.data || error.message
    );
    throw error; // Throw error so it can be handled in the component
  }
};

// Create a post (this can be used in Profile.jsx or a create post component)
export const createPost = async (postData, token) => {
  try {
    const response = await API.post("/api/posts", postData, {
      headers: { Authorization: `Bearer ${token}` }, // Attach the token to the request headers
    });
    return response.data; // Return the newly created post data if successful
  } catch (error) {
    console.error(
      "Error creating post:",
      error.response?.data || error.message
    );
    throw error; // Throw error so it can be handled in the component
  }
};

// Like/unlike a post (this can be used in Home.jsx or Profile.jsx)
export const likePost = async (postId, token) => {
  try {
    const response = await API.put(
      `/api/posts/${postId}/like`,
      {}, // Empty body, as it's a like/unlike action
      {
        headers: { Authorization: `Bearer ${token}` }, // Attach the token to the request headers
      }
    );
    return response.data; // Return the updated post data after liking/unliking
  } catch (error) {
    console.error("Error liking post:", error.response?.data || error.message);
    throw error; // Throw error so it can be handled in the component
  }
};

// Add a comment to a post (this can be used in PostDetail.jsx or Profile.jsx)
export const addComment = async (postId, commentData, token) => {
  try {
    const response = await API.post(
      `/api/posts/${postId}/comment`,
      commentData,
      {
        headers: { Authorization: `Bearer ${token}` }, // Attach the token to the request headers
      }
    );
    return response.data; // Return the updated post with the new comment
  } catch (error) {
    console.error(
      "Error adding comment:",
      error.response?.data || error.message
    );
    throw error; // Throw error so it can be handled in the component
  }
};
