import mongoose from 'mongoose';
import postSchema from '../schemas/db/postSchema.js';

export const Post = mongoose.model('Post', postSchema);

const postPopulate = (query) =>
  query
    .populate('user', ['username', 'isAdmin'])
    .populate('likes', ['username'])
    .populate('comments.user', ['username', 'isAdmin']);

export const createPost = (data) => Post.create(data);

export const countPosts = () => Post.countDocuments();

export const findPostsPaginated = ({ skip, limit }) =>
  postPopulate(
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
      },
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  );

export const findPostById = (id) => postPopulate(Post.findById(id));

export const findPostLikesById = (id) => Post.findById(id).select('likes').lean();

export const updatePostById = (id, update, options) => Post.findByIdAndUpdate(id, update, options);

export const pushCommentToPost = async (postId, comment) => {
  const post = await Post.findById(postId);
  if (!post) return null;
  post.comments.push(comment);
  await post.save();
  return postPopulate(Post.findById(post._id));
};
