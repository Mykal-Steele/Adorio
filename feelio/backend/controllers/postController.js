const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Post = require("../models/Post");
const getIO = require("../utils/socket");

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const newPost = await Post.create({
    title,
    content,
    user: req.user.id,
  });
  res.status(201).json({
    status: "success",
    data: { post: newPost },
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find().populate("user comments.user");
  res.status(200).json({
    status: "success",
    results: posts.length,
    data: { posts },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "user comments.user"
  );

  if (!post) return next(new AppError("Post not found", 404));

  res.status(200).json({
    status: "success",
    data: { post },
  });
});

exports.toggleLike = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  const userId = req.user.id;
  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  const io = getIO();
  io.to(post._id.toString()).emit("likeUpdate", {
    postId: post._id,
    likes: post.likes,
  });

  res.status(200).json({
    status: "success",
    data: { likes: post.likes },
  });
});

exports.addComment = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  const newComment = {
    text: req.body.text,
    user: req.user.id,
  };

  post.comments.unshift(newComment);
  await post.save();

  await Post.populate(post, {
    path: "comments.user",
    select: "username avatar",
  });

  const io = getIO();
  io.to(post._id.toString()).emit("newComment", {
    ...newComment,
    postId: post._id,
    createdAt: new Date(),
    user: {
      _id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar,
    },
  });

  res.status(201).json({
    status: "success",
    data: { comment: newComment },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("Post not found", 404));

  if (post.user.toString() !== req.user.id) {
    return next(
      new AppError("You do not have permission to delete this post", 403)
    );
  }

  await post.remove();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
