import React from "react";
import { motion } from "framer-motion";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const InteractionButtons = ({
  userLiked,
  likesCount,
  commentsCount,
  onLike,
  onToggleComments,
}) => {
  return (
    <div className="flex items-center gap-6 mt-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLike}
        className="flex items-center gap-2 group like-button" // Add "like-button" class here
        data-like-state={userLiked ? "liked" : "unliked"}
        type="button"
      >
        {userLiked ? (
          <HeartIconSolid className="h-6 w-6 text-red-500" />
        ) : (
          <HeartIcon className="h-6 w-6 text-gray-400 group-hover:text-red-400 transition-colors" />
        )}
        <span
          className={`text-sm ${userLiked ? "text-red-500" : "text-gray-400"}`}
        >
          {likesCount}
        </span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleComments}
        className="flex items-center gap-2 group"
        type="button"
      >
        <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
        <span className="text-sm text-gray-400">{commentsCount}</span>
      </motion.button>
    </div>
  );
};

export default InteractionButtons;
