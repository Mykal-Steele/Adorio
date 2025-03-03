import React, { useEffect, useState, useCallback } from "react";
import { getPosts, createPost, likePost } from "../api";
import PostCard from "../Components/PostCard";
import { useSelector } from "react-redux";
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../Components/SkeletonLoader";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const TITLE_CHARACTER_LIMIT = 100;

  const handleLike = async (postId) => {
    try {
      const updatedPost = await likePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
      setError({
        message: "Failed to like post. Please try again.",
        status: "Error",
      });
    }
  };

  // In the fetchPosts function, update this part:
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPosts(page);
      console.log("API Response:", response); // Add this for debugging

      // Access the nested posts array correctly
      const newPosts = response.posts || [];

      setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(response.hasMore);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError({
        message: err.message || "Failed to fetch posts.",
        status: err.response?.status || "Network Error",
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const [lastPostRef] = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage((prev) => prev + 1),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png"];
      if (validImageTypes.includes(file.type)) {
        setImage(file);
        try {
          setImagePreview(URL.createObjectURL(file));
        } catch (error) {
          console.error("Error creating object URL:", error);
          setError({
            message: "Failed to load image preview.",
          });
        }
      } else {
        setError({
          message: "Invalid file type. Please upload an image (JPEG or PNG).",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // Ensure image is appended correctly
      if (image instanceof File) {
        formData.append("image", image);
      }

      const response = await createPost(formData);

      // Update local state with the new post including image
      setPosts((prev) => [
        {
          ...response,
          user: { _id: user._id, username: user.username }, // Add author info
          image: response.image || null,
        },
        ...prev,
      ]);
      setTitle("");
      setContent("");
      setImage(null);
      setImagePreview("");
    } catch (err) {
      setError({ message: err.message || "Failed to create post" });
    } finally {
      setIsCreating(false);
    }
  };

  const ErrorMessage = ({ error }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-50"
    >
      <div className="bg-gray-900/90 backdrop-blur-lg p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl border border-purple-500/20 flex items-start gap-2 sm:gap-3 max-w-md">
        <div className="bg-purple-500/10 p-1.5 sm:p-2 rounded-md">
          <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            {error.status} Error
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
            {error.message}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-1.5 text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-gray-950 pb-16 sm:pb-0">
      <AnimatePresence>
        {error && <ErrorMessage error={error} />}
      </AnimatePresence>

      <div className="container mx-auto max-w-2xl px-2 sm:px-4 py-6 sm:py-8 pt-16 sm:pt-20">
        {/* Loading State */}
        {loading && (
          <motion.div className="text-center py-6">
            <p className="text-gray-400">Loading new posts...</p>
          </motion.div>
        )}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-3"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            className="bg-purple-600/20 p-2 sm:p-3 rounded-lg sm:rounded-xl"
          >
            <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
          </motion.div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">
            Recent Posts
          </h1>
        </motion.div>

        {/* Post Creation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 sm:mb-8 p-3 sm:p-6 bg-gray-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-gray-800/50 shadow-lg hover:shadow-xl transition-all"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Create a New Post
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Title Input */}
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 placeholder-gray-500"
                required
                disabled={isCreating}
                maxLength={TITLE_CHARACTER_LIMIT}
              />
              <div className="absolute bottom-1.5 sm:bottom-2 right-2 text-xs text-gray-400">
                {title.length}/{TITLE_CHARACTER_LIMIT}
              </div>
            </div>

            {/* Content Input */}
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 placeholder-gray-500"
              rows="3"
              required
              disabled={isCreating}
            />

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-medium text-gray-400">
                Upload Image (Optional)
              </label>
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-700/50 rounded-lg cursor-pointer hover:border-purple-500/50 transition-all relative overflow-hidden group"
              >
                <div className="flex flex-col items-center justify-center pt-3 sm:pt-5 pb-4 sm:pb-6 z-10">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </motion.div>
                  <p className="text-xs sm:text-sm text-gray-500 group-hover:text-purple-300 transition-colors text-center px-2">
                    Click to upload or drag and drop
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isCreating}
                />
              </motion.label>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-lg overflow-hidden border border-gray-800/50"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 sm:h-48 object-cover"
                  />
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-2 sm:py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-xl transition-all relative overflow-hidden group"
              disabled={isCreating}
            >
              <span className="relative z-10 text-sm sm:text-base">
                {isCreating ? "Creating..." : "Create Post"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </form>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 sm:space-y-6 pb-8"
        >
          {posts.map((post, index) => {
            console.log("Rendering post:", post); //  Add this line
            return (
              <div
                ref={index === posts.length - 1 ? lastPostRef : null}
                key={post._id}
              >
                <PostCard
                  {...post}
                  currentUserId={user?._id}
                  onLike={handleLike}
                  onCommentAdded={(updatedPost) => {
                    setPosts((prevPosts) =>
                      prevPosts.map((p) =>
                        p._id === updatedPost._id ? updatedPost : p
                      )
                    );
                  }}
                />
              </div>
            );
          })}

          {loading && <SkeletonLoader count={3} />}

          {!loading && !hasMore && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-center py-6 sm:py-8 bg-gray-900/50 rounded-lg border border-gray-800/40"
            >
              <p className="text-sm sm:text-base text-gray-400">
                No more posts to load
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
