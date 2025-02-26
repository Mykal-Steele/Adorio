// feelio/src/components/PostActions.jsx
import React from "react";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from "@heroicons/react/24/solid";
import { useLikePost, useSavePost } from "../hooks/usePosts";
import { motion } from "framer-motion";

const PostActions = ({ post }) => {
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
      <div className="flex space-x-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => likePost(post._id)}
          className="flex items-center space-x-1"
        >
          {post.isLiked ? (
            <HeartSolid className="w-6 h-6 text-red-500" />
          ) : (
            <HeartIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
          <span className="text-sm">{post.likesCount}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-1"
        >
          <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="text-sm">{post.commentsCount}</span>
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => savePost(post._id)}
      >
        {post.isSaved ? (
          <BookmarkSolid className="w-6 h-6 text-blue-500" />
        ) : (
          <BookmarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        )}
      </motion.button>
    </div>
  );
};

export default PostActions;
