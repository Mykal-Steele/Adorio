import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { createPostSchema, addCommentSchema, getPostsQuerySchema } from '../schemas/index.js';
import { normalizeExistingImage } from '../utils/imageFormatter.js';
import {
  createPost as dbCreatePost,
  countPosts,
  findPostsPaginated,
  findPostById as dbFindPostById,
  findPostLikesById,
  updatePostById,
  pushCommentToPost,
} from '../models/index.js';

const normalizePost = (doc) => {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : doc;
  plain.image = plain.image ? normalizeExistingImage(plain.image) : null;
  if (Array.isArray(plain.comments)) {
    plain.comments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  return plain;
};

export const createPost = async ({ userId, title, content, image }) => {
  validate(createPostSchema, { title, content });
  const post = await dbCreatePost({ title, content, user: userId, image: image || null });
  return normalizePost(post);
};

export const getPaginatedPosts = async (rawQuery) => {
  const { page, limit } = validate(getPostsQuerySchema, rawQuery);
  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    findPostsPaginated({ skip, limit }),
    countPosts(),
  ]);

  const normalizedPosts = posts.map(normalizePost).filter(Boolean);

  return {
    posts: normalizedPosts,
    hasMore: totalPosts > skip + limit,
    totalPosts,
    currentPage: page,
    totalPages: Math.max(Math.ceil(totalPosts / limit), 1),
  };
};

export const getPostById = async (postId) => {
  const post = await dbFindPostById(postId);
  if (!post) throw ApiError.notFound('Post not found');
  return normalizePost(post);
};

export const togglePostLike = async ({ postId, userId }) => {
  const existing = await findPostLikesById(postId);
  if (!existing) throw ApiError.notFound('Post not found');

  const isLiked = existing.likes.some((id) => id.toString() === userId);
  const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

  const post = await updatePostById(postId, update, { new: true });
  return { post, action: isLiked ? 'unliked' : 'liked' };
};

export const addCommentToPost = async ({ postId, userId, text }) => {
  validate(addCommentSchema, { text });
  const post = await pushCommentToPost(postId, { text, user: userId, createdAt: new Date() });
  if (!post) throw ApiError.notFound('Post not found');
  return normalizePost(await post);
};
