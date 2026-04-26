import API from './index';
import { handleApiError } from '../utils/errorHandling';

const logger = {
  error: (message, data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, data);
    }
  },
  warn: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message);
    }
  },
  info: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message);
    }
  },
};

export const getPosts = async (page = 1, limit = 5, signal?: AbortSignal) => {
  try {
    const response = await API.get(`/posts?page=${page}&limit=${limit}`, {
      signal,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'failed to fetch posts');
  }
};

export const createPost = async (postData) => {
  try {
    const config =
      postData instanceof FormData
        ? { headers: {} }
        : { headers: { 'Content-Type': 'application/json' } };

    const response = await API.post('/posts', postData, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'error creating post');
  }
};

const likeIntents = {};
const pendingRequests = {};

export const likePost = async (postId, shouldBeLiked) => {
  likeIntents[postId] = { shouldBeLiked, timestamp: Date.now() };

  if (pendingRequests[postId]) {
    return pendingRequests[postId];
  }

  pendingRequests[postId] = (async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finalIntent = likeIntents[postId];

      if (process.env.NODE_ENV !== 'production') {
        logger.info(
          `Sending FINAL like state for post ${postId}: ${
            finalIntent.shouldBeLiked ? 'LIKED' : 'UNLIKED'
          }`,
        );
      }

      const response = await API.put(`/posts/${postId}/like`, {
        shouldBeLiked: finalIntent.shouldBeLiked,
      });

      delete likeIntents[postId];
      return response.data;
    } catch (error) {
      throw handleApiError(error, `failed to ${shouldBeLiked ? 'like' : 'unlike'} post`);
    } finally {
      delete pendingRequests[postId];
    }
  })();

  return pendingRequests[postId];
};

export const addComment = async (postId, commentText) => {
  try {
    const response = await API.post(`/posts/${postId}/comment`, {
      text: commentText,
      optimisticId: `temp-${Date.now()}`,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'error adding comment');
  }
};

export const getSinglePost = async (postId) => {
  try {
    const response = await API.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'error fetching post');
  }
};
