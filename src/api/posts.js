// feelio/src/api/posts.js
import API from "./index";
//all post
export const getPosts = async (page = 1, limit = 5) => {
  try {
    const response = await API.get(`/posts?page=${page}&limit=${limit}`);
    console.log("Posts API Response:", response);
    return response.data; // This returns the entire response object
  } catch (error) {
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    throw new Error(error.response?.data?.message || "Failed to fetch posts");
  }
};
// Create a new post
// feelio/src/api/posts.js
export const createPost = async (postData) => {
  try {
    const config =
      postData instanceof FormData
        ? { headers: {} } // Let axios set Content-Type automatically
        : { headers: { "Content-Type": "application/json" } };

    const response = await API.post("/posts", postData, config);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId) => {
  try {
    const response = await API.put(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error liking post:", error.response?.data || error.message);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, commentText) => {
  try {
    const response = await API.post(`/posts/${postId}/comment`, {
      text: commentText,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Get a single post by ID
export const getSinglePost = async (postId) => {
  try {
    const response = await API.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching single post:", error);
    throw error;
  }
};
