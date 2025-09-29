import Post from '../models/Post.js';
import ApiError from '../utils/ApiError.js';

const createPost = async ({ userId, title, content, image }) => {
  if (!title || !content) {
    throw ApiError.badRequest('Title and content are required');
  }

  const post = await Post.create({
    title,
    content,
    user: userId,
    image,
  });

  return post;
};

const getPaginatedPosts = async ({ page = 1, limit = 5 }) => {
  const parsedPage = Number.isNaN(Number(page)) ? 1 : Math.max(1, Number(page));
  const parsedLimit = Number.isNaN(Number(limit))
    ? 5
    : Math.max(1, Number(limit));
  const skip = (parsedPage - 1) * parsedLimit;

  const [posts, totalPosts] = await Promise.all([
    Post.find(
      {},
      {
        title: 1,
        content: 1,
        user: 1,
        likes: 1,
        'comments._id': 1,
        'comments.text': 1,
        'comments.user': 1,
        'comments.createdAt': 1,
        image: 1,
        createdAt: 1,
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

  return {
    posts,
    hasMore: totalPosts > skip + parsedLimit,
    totalPosts,
    currentPage: parsedPage,
    totalPages: Math.ceil(totalPosts / parsedLimit) || 1,
  };
};

const getPostById = async (postId) => {
  const post = await Post.findById(postId)
    .populate('user', ['username'])
    .populate('likes', ['username'])
    .populate('comments.user', ['username'])
    .lean();

  if (!post) {
    throw ApiError.notFound('post not found');
  }

  post.comments = [...(post.comments || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return post;
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

  return populatedPost;
};

export {
  createPost,
  getPaginatedPosts,
  getPostById,
  togglePostLike,
  addCommentToPost,
};
