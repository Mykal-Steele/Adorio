// my api calls for post stuff - split this from index.js cuz it was getting messy
import API from "./index";

// made this so i don't have to type console.log everywhere
const logger = {
  error: (message, data) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(message, data);
    }
    // could hook up something like sentry here later
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

// my error handling function cuz there's like 5 different ways requests can fail
const handleApiError = (error, customMessage) => {
  // network problems like wifi dropping
  if (!error.response) {
    logger.warn("Network error while making API request");
    return new Error(
      "Network connection issue. Please check your internet connection."
    );
  }

  // log all the details so i can debug later
  logger.error(customMessage || "API Error", {
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
  });

  // give back something helpful to the user
  return new Error(
    error.response?.data?.message ||
      customMessage ||
      "An unexpected error occurred"
  );
};

// gets posts for the main feed - wrote this like 5 times before it worked right
export const getPosts = async (page = 1, limit = 5, signal) => {
  try {
    const response = await API.get(`/posts?page=${page}&limit=${limit}`, {
      signal,
      timeout: 10000, // 10 sec timeout cuz my free tier backend is slow sometimes
    });
    return response.data;
  } catch (error) {
    // don't log cancellations, they happen all the time with infinite scroll
    if (
      error.name === "AbortError" ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("canceled")
    ) {
      const abortError = new Error("Request cancelled");
      abortError.name = "AbortError";
      throw abortError;
    }

    // for when the wifi drops
    if (!error.response) {
      console.warn(
        "Network error while fetching posts - might be offline or server unreachable"
      );
      throw new Error(
        "Network connection issue. Please check your internet connection."
      );
    }

    // gotta log these errors so i can fix them later
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });

    throw new Error(error.response?.data?.message || "Failed to fetch posts");
  }
};

// posts new content to the feed - had to figure out form data for images
export const createPost = async (postData) => {
  try {
    const config =
      postData instanceof FormData
        ? { headers: {} } // let axios figure out content-type for forms
        : { headers: { "Content-Type": "application/json" } };

    const response = await API.post("/posts", postData, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Error creating post");
  }
};

// tracking likes so we don't spam the server
const likeIntents = {};
const pendingRequests = {};

export const likePost = async (postId, shouldBeLiked) => {
  // save what the user actually wants (if they tap multiple times)
  likeIntents[postId] = { shouldBeLiked, timestamp: Date.now() };

  // if we're already doing a like operation, just update our intent
  if (pendingRequests[postId]) {
    return pendingRequests[postId];
  }

  // make a new request with a promise
  pendingRequests[postId] = (async () => {
    try {
      // wait a bit to see if user clicks again, this reduces spam
      await new Promise((resolve) => setTimeout(resolve, 100));

      // get the latest intent (in case user clicked multiple times)
      const finalIntent = likeIntents[postId];

      if (process.env.NODE_ENV !== "production") {
        logger.info(
          `Sending FINAL like state for post ${postId}: ${
            finalIntent.shouldBeLiked ? "LIKED" : "UNLIKED"
          }`
        );
      }

      // finally make the api call with the final state
      const response = await API.put(`/posts/${postId}/like`, {
        shouldBeLiked: finalIntent.shouldBeLiked,
      });

      // clean up after success
      delete likeIntents[postId];
      return response.data;
    } catch (error) {
      logger.error("Error processing like intent:", error);
      throw error;
    } finally {
      // always clean up
      delete pendingRequests[postId];
    }
  })();

  return pendingRequests[postId];
};

// lets users comment on posts - super simple endpoint
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

// grabs a single post with all its details for the post page
export const getSinglePost = async (postId) => {
  try {
    const response = await API.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    logger.error("Error fetching single post:", error);
    throw error;
  }
};
