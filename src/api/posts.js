// feelio/src/api/posts.js
import API from "./index";

// Centralized logging utility
const logger = {
  error: (message, data) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(message, data);
    }
    // In production, you could send to monitoring service instead
  },
  warn: (message) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(message);
    }
  },
  info: (message) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(message);
    }
  },
};

// Create a reusable error handler function (add near the top)

// Standardized error handler
const handleApiError = (error, customMessage) => {
  if (
    error.name === "AbortError" ||
    error.code === "ECONNABORTED" ||
    error.message?.includes("canceled")
  ) {
    // This is an expected abort, just return a standard abort error
    const abortError = new Error("Request cancelled");
    abortError.name = "AbortError";
    return abortError;
  }

  // Network errors
  if (!error.response) {
    logger.warn("Network error while making API request");
    return new Error(
      "Network connection issue. Please check your internet connection."
    );
  }

  // Log detailed error info
  logger.error(customMessage || "API Error", {
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
  });

  // Return user-friendly error
  return new Error(
    error.response?.data?.message ||
      customMessage ||
      "An unexpected error occurred"
  );
};

//all post
// Update getPosts to accept an AbortSignal
export const getPosts = async (page = 1, limit = 5, signal) => {
  try {
    const response = await API.get(`/posts?page=${page}&limit=${limit}`, {
      signal,
      timeout: 10000, // 10 seconds timeout
    });
    return response.data;
  } catch (error) {
    // Silently handle expected cancellations without logging
    if (
      error.name === "AbortError" ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("canceled")
    ) {
      // Don't log anything for aborted requests during normal scrolling
      const abortError = new Error("Request cancelled");
      abortError.name = "AbortError";
      throw abortError;
    }

    // For network errors that might happen during fast scrolling
    if (!error.response) {
      console.warn(
        "Network error while fetching posts - might be offline or server unreachable"
      );
      throw new Error(
        "Network connection issue. Please check your internet connection."
      );
    }

    // For actual server errors
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
    throw handleApiError(error, "Error creating post");
  }
};

// Intent tracking system
const likeIntents = {};
const pendingRequests = {};

export const likePost = async (postId, shouldBeLiked) => {
  // Always store the latest intent for this post
  likeIntents[postId] = { shouldBeLiked, timestamp: Date.now() };

  // Cancel any existing request that hasn't completed
  if (pendingRequests[postId]) {
    // Let the existing request complete, we'll just update at the end
    return pendingRequests[postId];
  }

  // Create a new request promise
  pendingRequests[postId] = (async () => {
    try {
      // Slight delay to allow rapid click batching
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the final intent that may have changed during the delay
      const finalIntent = likeIntents[postId];

      if (process.env.NODE_ENV !== "production") {
        logger.info(
          `Sending FINAL like state for post ${postId}: ${
            finalIntent.shouldBeLiked ? "LIKED" : "UNLIKED"
          }`
        );
      }

      // Make the actual API request with the FINAL state
      const response = await API.put(`/posts/${postId}/like`, {
        shouldBeLiked: finalIntent.shouldBeLiked,
      });

      // Clean up after successful request
      delete likeIntents[postId];
      return response.data;
    } catch (error) {
      logger.error("Error processing like intent:", error);
      throw error;
    } finally {
      // Always clean up the pending request
      delete pendingRequests[postId];
    }
  })();

  return pendingRequests[postId];
};

// Add a comment to a post
export const addComment = async (postId, commentText) => {
  try {
    const response = await API.post(`/posts/${postId}/comment`, {
      text: commentText,
    });
    return response.data;
  } catch (error) {
    logger.error("Error adding comment:", error);
    throw error;
  }
};

// Get a single post by ID
export const getSinglePost = async (postId) => {
  try {
    const response = await API.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    logger.error("Error fetching single post:", error);
    throw error;
  }
};
