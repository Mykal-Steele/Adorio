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
export const createPost = async (postData) => {
  try {
    const isFormData = postData.image instanceof File;
    let data;

    if (isFormData) {
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      if (postData.image) {
        formData.append("image", postData.image);
      }
      data = formData;
    } else {
      data = { title: postData.title, content: postData.content };
    }

    console.log("Sending post data:", data);

    const response = await API.post("/posts", data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });

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
