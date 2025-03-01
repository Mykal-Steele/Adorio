import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPosts } from "../api";
import PostCard from "../Components/PostCard";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../Components/SkeletonLoader";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getPosts();
        const userPosts = Array.isArray(response)
          ? response.filter((post) => post.user?._id === user?._id)
          : [];
        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  if (loading) {
    return <SkeletonLoader count={3} />; // Use SkeletonLoader for loading state
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-900/30 text-red-400 p-4 rounded-lg border border-red-800/50 backdrop-blur-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto max-w-2xl px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            className="bg-purple-600/20 p-3 rounded-xl"
          >
            <SparklesIcon className="h-8 w-8 text-purple-400" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">
            {user?.username}'s Posts
          </h1>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 pb-8"
        >
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                _id={post._id}
                title={post.title}
                content={post.content}
                author={post.user?.username || "Unknown"}
                image={post.image}
                likes={post.likes}
                comments={post.comments}
                createdAt={post.createdAt}
              />
            ))
          ) : (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-center py-8 bg-gray-900/50 rounded-2xl border border-gray-800/40"
            >
              <p className="text-gray-400">
                No posts available. Start creating posts!
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
