import React, { useState } from "react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import moment from "moment";
import { addComment } from "../api";
import { motion, AnimatePresence } from "framer-motion";

const PostCard = ({
  _id,
  title,
  content,
  author,
  image: postImage,
  likes = [],
  comments: initialComments = [],
  createdAt,
  onCommentAdded,
  onLike,
  currentUserId,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsScrollTop, setCommentsScrollTop] = useState(0);

  const userLiked = likes.some(
    (like) =>
      (like._id?.toString() || like.toString()) === currentUserId?.toString()
  );

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedPost = await addComment(_id, newComment); // Using _id here
      setComments(updatedPost.comments);
      setNewComment("");
      onCommentAdded(updatedPost);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const toggleComment = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };
  const handleCommentsScroll = (e) => {
    setCommentsScrollTop(e.target.scrollTop);
  };

  const handleLike = async () => {
    try {
      await onLike(_id); // Call the onLike function passed from the parent
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const toggleContent = () => setIsContentExpanded(!isContentExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800/60 shadow-2xl hover:shadow-2xl transition-all relative group"
    >
      {/* Author Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-0.5 rounded-full"
          >
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent font-medium">
                {author?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </motion.div>
          <div>
            <p className="font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              {author}
            </p>
            <p className="text-sm text-gray-400">
              {moment(createdAt).fromNow()}
            </p>
          </div>
        </div>
      </div>

      {/* Post Image */}
      {postImage && (
        <motion.div
          className="mb-4 rounded-2xl overflow-hidden border border-gray-800/40"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={`http://localhost:5000${postImage.replace(
              /^\/(feelio|backend\/routes)/,
              ""
            )}`}
            alt="Post content"
            className="w-full h-64 object-cover"
          />
        </motion.div>
      )}

      {/* Post Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="relative">
          <p
            className={`text-gray-300 ${
              isContentExpanded ? "" : "line-clamp-3"
            }`}
          >
            {content}
          </p>
          {content.length > 150 && (
            <button
              onClick={toggleContent}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-1"
            >
              {isContentExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      {/* Interaction Bar */}
      <div className="flex items-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className="flex items-center gap-1"
        >
          {userLiked ? (
            <HeartIconSolid className="h-6 w-6 text-red-400" />
          ) : (
            <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-400" />
          )}
          <span className={`${userLiked ? "text-red-400" : "text-gray-400"}`}>
            {likes.length}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1"
        >
          <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-400 hover:text-blue-400" />
          <span className="text-gray-400">{comments.length}</span>
        </motion.button>
      </div>

      {/* Enhanced Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-800/40 relative"
          >
            {/* Sticky Close Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: Math.min(commentsScrollTop, 100),
                transition: { type: "spring", stiffness: 300 },
              }}
              exit={{ opacity: 0 }}
              className="fixed md:absolute right-8 top-24 md:right-4 md:-top-4 z-50 p-2 bg-gray-900/80 backdrop-blur-lg rounded-full border border-gray-800/60 hover:border-purple-500/50 transition-all group"
              onClick={() => setShowComments(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-400 group-hover:text-purple-400" />
            </motion.button>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-800/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 placeholder-gray-500"
                  disabled={isSubmitting}
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="mt-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all relative overflow-hidden group"
                disabled={isSubmitting}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </form>

            {/* Enhanced Comments List */}
            <div
              className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
              onScroll={handleCommentsScroll}
            >
              {comments
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-gray-900/50 rounded-xl border border-gray-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-xs text-white">
                        {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="space-y-1">
                          <span className="text-sm font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                            {comment.user?.username || "Unknown"}
                          </span>
                          <div className="relative">
                            <p
                              className={`text-gray-300 ${
                                !expandedComments[comment._id] && "line-clamp-3"
                              }`}
                            >
                              {comment.text}
                            </p>
                            {comment.text.length > 150 && (
                              <button
                                onClick={() => toggleComment(comment._id)}
                                className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-1"
                              >
                                {expandedComments[comment._id]
                                  ? "Show less"
                                  : "Show more"}
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {moment(comment.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
