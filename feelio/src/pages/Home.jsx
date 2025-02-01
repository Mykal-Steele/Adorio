import React, { useEffect, useState } from "react";
import { getPosts, createPost, likePost } from "../api";
import PostCard from "../Components/PostCard";
import { useDispatch, useSelector } from "react-redux";
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../Components/SkeletonLoader";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleLike = async (postId) => {
    try {
      const updatedPost = await likePost(postId);
      setPosts(
        posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPosts();
      const postsArray = Array.isArray(response)
        ? response
        : response?.data || [];
      setPosts(postsArray);
    } catch (err) {
      console.error("Full Error Object:", err);
      setError({
        message: err.message,
        status: err.response?.status || "Network Error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await createPost({ title, content, image });
      if (response.status === 201) {
        setPosts([response.data, ...posts]);
        setTitle("");
        setContent("");
        setImage(null);
        setImagePreview("");
      } else {
        throw new Error(response.data?.message || "Failed to create post");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError({
        message: err.response?.data?.message || err.message || "Server Error",
        status: err.response?.status || 500,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Error display component
  const ErrorMessage = ({ error }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg shadow-lg border border-red-100 dark:border-red-900/50 flex items-start gap-3 max-w-md">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-700 dark:text-red-400">
            {error.status} Error
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            {error.message}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return <SkeletonLoader count={1} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error Display */}
      <AnimatePresence>
        {error && <ErrorMessage error={error} />}
      </AnimatePresence>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <SparklesIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Recent Posts
          </h1>
        </div>

        {/* Post Creation Card */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Create a New Post
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              required
              disabled={isCreating}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              rows="4"
              required
              disabled={isCreating}
            />

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Image (Optional)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CameraIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isCreating}
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Post"}
            </button>
          </form>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                title={post.title}
                content={post.content}
                author={post.user?.username || "Unknown"}
                likes={post.likes}
                comments={post.comments}
                createdAt={post.createdAt}
                currentUserId={user?._id}
                onCommentAdded={(updatedPost) => {
                  setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                      p._id === updatedPost._id ? updatedPost : p
                    )
                  );
                }}
                onLike={async (postId) => {
                  try {
                    const updatedPost = await likePost(postId);
                    setPosts((prevPosts) =>
                      prevPosts.map((p) =>
                        p._id === updatedPost._id ? updatedPost : p
                      )
                    );
                  } catch (err) {
                    console.error("Error liking post:", err);
                  }
                }}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No posts available. Be the first to create one!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
