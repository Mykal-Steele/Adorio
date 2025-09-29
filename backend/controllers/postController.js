import asyncHandler from '../utils/asyncHandler.js';
import {
  createPost,
  getPaginatedPosts,
  getPostById,
  togglePostLike,
  addCommentToPost,
} from '../services/postService.js';
import { extractUploadedImageMetadata } from '../utils/imageFormatter.js';

const createPostHandler = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const image = extractUploadedImageMetadata(req.file) || undefined;

  const post = await createPost({
    userId: req.user.id,
    title,
    content,
    image,
  });

  res.status(201).json(post);
});

const getPostsHandler = asyncHandler(async (req, res) => {
  const pagination = await getPaginatedPosts({
    page: req.query.page,
    limit: req.query.limit,
  });

  res.status(200).json(pagination);
});

const getSinglePostHandler = asyncHandler(async (req, res) => {
  const post = await getPostById(req.params.id);
  res.status(200).json(post);
});

const toggleLikeHandler = asyncHandler(async (req, res) => {
  const { post, action } = await togglePostLike({
    postId: req.params.id,
    userId: req.user.id,
  });

  res.status(200).json({
    _id: post._id,
    likes: post.likes,
    action,
    optimisticId: req.body.optimisticId || null,
  });
});

const addCommentHandler = asyncHandler(async (req, res) => {
  const populatedPost = await addCommentToPost({
    postId: req.params.id,
    userId: req.user.id,
    text: req.body.text,
  });

  res.status(201).json(populatedPost);
});

export {
  createPostHandler,
  getPostsHandler,
  getSinglePostHandler,
  toggleLikeHandler,
  addCommentHandler,
};
