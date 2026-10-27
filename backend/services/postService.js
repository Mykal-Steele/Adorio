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
  deletePostById,
  findUsersByIds,
  findPostCommentsMeta,
} from '../models/index.js';

// Levels 0, 1, 2 render indented, anything deeper gets flattened onto its level-2
// ancestor. Keep in sync with MAX_THREAD_DEPTH in src/views/Home/constants/feed.ts.
export const MAX_THREAD_DEPTH = 2;

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
  const { page, limit, hasImage, user } = validate(getPostsQuerySchema, rawQuery);
  const skip = (page - 1) * limit;
  // Filter in the query, not client-side after fetching a page. Otherwise
  // pagination and "has more" count the wrong set, and a filter that matches a
  // few posts keeps loading pages long after it's out of matches.
  const filter = {
    ...(hasImage ? { image: { $ne: null } } : {}),
    ...(user ? { user } : {}),
  };

  const [posts, totalPosts] = await Promise.all([
    findPostsPaginated({ skip, limit, filter }),
    countPosts(filter),
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

export const deletePost = async ({ postId, userId }) => {
  const post = await dbFindPostById(postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.user._id.toString() !== userId) throw ApiError.forbidden('Not authorized');
  await deletePostById(postId);
};

export const addCommentToPost = async ({ postId, userId, text, parentId, mentions }) => {
  const {
    text: cleanText,
    parentId: cleanParentId,
    mentions: mentionIds,
  } = validate(addCommentSchema, { text, parentId, mentions });
  // cheap comments-only query to check the parent. The full populate happens
  // once, in pushCommentToPost, for the response.
  const meta = await findPostCommentsMeta(postId);
  if (!meta) throw ApiError.notFound('Post not found');

  let effectiveParentId = null;
  let depth = 0;
  if (cleanParentId) {
    const parent = meta.comments.find((c) => c._id?.toString() === cleanParentId);
    if (!parent) throw ApiError.badRequest('Parent comment not found');
    const parentDepth = parent.depth ?? 0;
    if (parentDepth + 1 > MAX_THREAD_DEPTH) {
      effectiveParentId = parent._id;
      depth = MAX_THREAD_DEPTH;
    } else {
      effectiveParentId = parent._id;
      depth = parentDepth + 1;
    }
  }

  let validMentions = [];
  if (mentionIds.length > 0) {
    const found = await findUsersByIds(mentionIds);
    const foundIds = new Set(found.map((u) => u._id.toString()));
    validMentions = mentionIds.filter((id) => foundIds.has(id));
  }

  const updated = await pushCommentToPost(postId, {
    text: cleanText,
    user: userId,
    parentId: effectiveParentId,
    depth,
    mentions: validMentions,
  });
  if (!updated) throw ApiError.notFound('Post not found');
  return normalizePost(updated);
};
