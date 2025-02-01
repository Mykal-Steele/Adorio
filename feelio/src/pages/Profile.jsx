import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPosts } from "../api";
import PostCard from "../Components/PostCard";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../Components/SkeletonLoader"; // Import the SkeletonLoader

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
    return <SkeletonLoader count={1} />; // Use SkeletonLoader here
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <SparklesIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user?.username}'s Posts
          </h1>
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
              />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No posts found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
