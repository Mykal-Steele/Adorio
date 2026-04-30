import API, { request } from './index';

export const getPosts = (page = 1, limit = 5, signal?: AbortSignal) =>
  request(
    API.get(`/posts?page=${page}&limit=${limit}`, {
      signal,
      timeout: 10000,
    }),
  );

export const createPost = (postData) => {
  const config =
    postData instanceof FormData
      ? { headers: {} }
      : { headers: { 'Content-Type': 'application/json' } };
  return request(API.post('/posts', postData, config));
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

      if (!finalIntent) {
        return null;
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `Sending FINAL like state for post ${postId}: ${
            finalIntent.shouldBeLiked ? 'LIKED' : 'UNLIKED'
          }`,
        );
      }

      const response = await API.put(`/posts/${postId}/like`, {
        shouldBeLiked: finalIntent.shouldBeLiked,
      });

      return response.data;
    } finally {
      delete likeIntents[postId];
      delete pendingRequests[postId];
    }
  })();

  return pendingRequests[postId];
};

export const addComment = (postId, commentText) =>
  request(
    API.post(`/posts/${postId}/comment`, {
      text: commentText,
    }),
  );

export const getSinglePost = (postId) => request(API.get(`/posts/${postId}`));
