import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';
import { normalizeExistingImage } from '../utils/imageFormatter.js';

const toPlainObject = (doc) => {
  if (!doc) {
    return null;
  }

  if (typeof doc.toObject === 'function') {
    return doc.toObject({ virtuals: true });
  }

  return { ...doc };
};

const normalizeId = (value) => {
  if (!value) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value.toString === 'function') {
    return value.toString();
  }

  return value;
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const plain = toPlainObject(user);

  if (!plain) {
    return null;
  }

  if (plain._id) {
    plain._id = normalizeId(plain._id);
  }

  if (plain.createdAt instanceof Date) {
    plain.createdAt = plain.createdAt.toISOString();
  }

  return plain;
};

const normalizeComment = (comment) => {
  const plain = toPlainObject(comment);

  if (!plain) {
    return null;
  }

  if (plain._id) {
    plain._id = normalizeId(plain._id);
  }

  if (plain.user) {
    plain.user = normalizeUser(plain.user);
  }

  if (plain.createdAt instanceof Date) {
    plain.createdAt = plain.createdAt.toISOString();
  }

  return plain;
};

const normalizeCommentsCollection = (comments = []) =>
  [...comments]
    .map(normalizeComment)
    .filter(Boolean)
    .sort((a, b) => {
      const aDate = new Date(a?.createdAt || 0).getTime();
      const bDate = new Date(b?.createdAt || 0).getTime();
      return bDate - aDate;
    });

const normalizePostDocument = (doc) => {
  const plain = toPlainObject(doc);

  if (!plain) {
    return null;
  }

  if (plain._id) {
    plain._id = normalizeId(plain._id);
  }

  if (plain.user) {
    plain.user = normalizeUser(plain.user);
  }

  plain.image = plain.image ? normalizeExistingImage(plain.image) : null;

  if (Array.isArray(plain.comments)) {
    plain.comments = normalizeCommentsCollection(plain.comments);
  }

  if (plain.createdAt instanceof Date) {
    plain.createdAt = plain.createdAt.toISOString();
  }

  if (plain.updatedAt instanceof Date) {
    plain.updatedAt = plain.updatedAt.toISOString();
  }

  return plain;
};

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

const createPost = async ({ userId, title, content, image }) => {
  if (!title || !content) {
    throw ApiError.badRequest('Title and content are required');
  }

  const post = await Post.create({
    title,
    content,
    user: userId,
    image: image || null,
  });

  return normalizePostDocument(post);
};

const getPaginatedPosts = async ({ page = 1, limit = 5 }) => {
  const parsedPage = parsePositiveNumber(page, 1);
  const parsedLimit = parsePositiveNumber(limit, 5);
  const skip = (parsedPage - 1) * parsedLimit;

  const [posts, totalPosts] = await Promise.all([
    Post.find(
      {},
      {
        title: 1,
        content: 1,
        user: 1,
        likes: 1,
        comments: 1,
        image: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate('user', ['username'])
      .populate('likes', ['username'])
      .populate('comments.user', ['username']),
    Post.countDocuments(),
  ]);

  const normalizedPosts = posts.map(normalizePostDocument).filter(Boolean);

  return {
    posts: normalizedPosts,
    hasMore: totalPosts > skip + parsedLimit,
    totalPosts,
    currentPage: parsedPage,
    totalPages: Math.max(Math.ceil(totalPosts / parsedLimit), 1),
  };
};

const getPostById = async (postId) => {
  const post = await Post.findById(postId)
    .populate('user', ['username'])
    .populate('likes', ['username'])
    .populate('comments.user', ['username']);

  if (!post) {
    throw ApiError.notFound('post not found');
  }

  return normalizePostDocument(post);
};

const togglePostLike = async ({ postId, userId }) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw ApiError.notFound('post not found');
  }

  const isLiked = post.likes.some((id) => id.toString() === userId);

  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  return { post, action: isLiked ? 'unliked' : 'liked' };
};

const addCommentToPost = async ({ postId, userId, text }) => {
  if (!text || !text.trim()) {
    throw ApiError.badRequest('comment text is required');
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw ApiError.notFound('post not found');
  }

  post.comments.push({ text, user: userId, createdAt: new Date() });
  await post.save();

  const populatedPost = await Post.findById(post._id)
    .populate('user', ['username'])
    .populate('comments.user', ['username']);

  return normalizePostDocument(populatedPost);
};

export {
  createPost,
  getPaginatedPosts,
  getPostById,
  togglePostLike,
  addCommentToPost,
};
