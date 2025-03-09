// my api calls for post stuff - split this from index.js cuz it was getting messy
import API from "./index";
import {
  handleApiError,
  AbortError,
  isAbortError,
} from "../utils/errorHandling";

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

// gets posts for the main feed - wrote this like 5 times before it worked right
export const getPosts = async (page = 1, limit = 5, signal) => {
  try {
    const response = await API.get(`/posts?page=${page}&limit=${limit}`, {
      signal,
      timeout: 10000, // giving it 10 secs cuz my free render instance takes forever to wake up
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "failed to fetch posts");
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
    throw handleApiError(error, "error creating post");
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
      throw handleApiError(
        error,
        `failed to ${shouldBeLiked ? "like" : "unlike"} post`
      );
    } finally {
      // always clean up
      delete pendingRequests[postId];
    }
  })();

  return pendingRequests[postId];
};

// comment system that breaks every time i touch it
export const addComment = async (postId, commentText) => {
  try {
    const response = await API.post(`/posts/${postId}/comment`, {
      text: commentText,
      optimisticId: `temp-${Date.now()}`, // still sending this for backwards compatibility
    });
    // server finally returns the whole post now thank god
    return response.data;
  } catch (error) {
    throw handleApiError(error, "error adding comment");
  }
};

// grabs a single post with all its details for the post page
export const getSinglePost = async (postId) => {
  try {
    const response = await API.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "error fetching post");
  }
};
