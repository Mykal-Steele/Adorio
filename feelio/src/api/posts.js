// feelio/src/api/posts.js
// feelio/src/api/posts.js
import API from "./index";
//all post
export const getPosts = async () => {
  try {
    const response = await API.get("/posts");
    console.log("Posts API Response:", response); // Debug log
    return response.data;
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
    // Determine if we have a file to upload
    const isFormData = postData.image instanceof File;
    let data;

    if (isFormData) {
      const formData = new FormData();
      Object.entries(postData).forEach(([key, value]) => {
        if (key === "image" && value) {
          formData.append("image", value);
        } else {
          formData.append(key, value);
        }
      });
      data = formData;
    } else {
      data = postData; // Send as normal JSON
    }

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
    console.error("Error liking post:", error);
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
