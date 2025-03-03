import React, { useState, useRef } from "react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import moment from "moment";
import { addComment } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import useClickOutside from "../hooks/useClickOutside";

const PostCard = ({
  _id,
  title,
  content,
  user,
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef(null);
  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

  const MAX_PREVIEW_LENGTH = 150;
  const shouldShowExpand = content.length > MAX_PREVIEW_LENGTH;
  const displayContent = isContentExpanded
    ? content
    : content.slice(0, MAX_PREVIEW_LENGTH) + (shouldShowExpand ? "..." : "");

  const userLiked = likes.some(
    (like) =>
      (like._id?.toString() || like.toString()) === currentUserId?.toString()
  );

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedPost = await addComment(_id, newComment);
      setComments(updatedPost.comments);
      setNewComment("");
      onCommentAdded(updatedPost);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentsScroll = (e) => {
    setCommentsScrollTop(e.target.scrollTop);
  };

  const handleLike = async () => {
    try {
      await onLike(_id);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const toggleContent = () => {
    setIsContentExpanded(!isContentExpanded);
    if (!isContentExpanded) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: window.scrollY + 50,
          behavior: "smooth",
        });
      });
    }
  };

  const toggleComment = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };
  const handleEmojiSelect = (emoji) => {
    setNewComment((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 bg-gray-900/80 backdrop-blur-md rounded-xl shadow-xl transition-all relative group hover:bg-gray-900/90"
    >
      {/* Author Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-0.5 rounded-full"
          >
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </motion.div>
          <div>
            <p className="font-medium text-gray-100">{user?.username}</p>
            <p className="text-sm text-gray-400">
              {moment(createdAt).fromNow()}
            </p>
          </div>
        </div>
      </div>

      {/* Post Image */}
      {postImage && (
        <motion.div
          className="mb-4 rounded-xl overflow-hidden relative cursor-pointer"
          whileHover={{ scale: 1.01 }}
        >
          <button
            onClick={() => setShowImageModal(true)}
            className="w-full h-full block relative group"
          >
            <img
              src={postImage.url}
              alt="Post content"
              className="w-full h-auto max-h-[600px] object-cover"
              loading="lazy"
              style={{ aspectRatio: "2 / 1.1" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ArrowsPointingOutIcon className="absolute top-3 right-3 h-6 w-6 text-white opacity-0 group-hover:opacity-75 transition-opacity" />
          </button>
        </motion.div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="relative max-w-full max-h-full rounded-2xl overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={postImage.url}
                alt="Post content"
                className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              />
              <button
                className="absolute top-4 right-4 p-2 bg-gray-900/80 backdrop-blur-lg rounded-full hover:bg-gray-800/60 transition-colors group"
                onClick={() => setShowImageModal(false)}
              >
                <XMarkIcon className="h-6 w-6 text-gray-200 group-hover:text-purple-400" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-100">{title}</h2>
        <div className="relative">
          <AnimatePresence initial={false}>
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-gray-300 whitespace-pre-line break-words">
                {displayContent}
              </p>
            </motion.div>
          </AnimatePresence>

          {shouldShowExpand && !isContentExpanded && (
            <button
              onClick={toggleContent}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 transition-colors"
            >
              Show more
            </button>
          )}
        </div>
      </div>

      {/* Interaction Bar */}
      <div className="flex items-center gap-6 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLike}
          className="flex items-center gap-2 group"
        >
          {userLiked ? (
            <HeartIconSolid className="h-6 w-6 text-red-500" />
          ) : (
            <HeartIcon className="h-6 w-6 text-gray-400 group-hover:text-red-400 transition-colors" />
          )}
          <span
            className={`text-sm ${
              userLiked ? "text-red-500" : "text-gray-400"
            }`}
          >
            {likes.length}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 group"
        >
          <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
          <span className="text-sm text-gray-400">{comments.length}</span>
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
                transition: { duration: 0.2 },
              }}
              exit={{ opacity: 0 }}
              className="fixed md:absolute right-8 top-24 md:right-4 md:-top-4 z-50 p-2 bg-gray-800/80 backdrop-blur-lg rounded-full hover:bg-gray-700/60 transition-colors group"
              onClick={() => setShowComments(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-200 group-hover:text-purple-400" />
            </motion.button>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 text-gray-300 bg-gray-800/50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                {/* Emoji Picker Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                >
                  😊
                </button>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-16 right-0 z-50"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="dark"
                      set="native"
                      previewPosition="none"
                      skinTonePosition="search"
                      dynamicWidth={true}
                      style={{
                        width: "350px",
                        height: "400px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                      }}
                    />
                  </div>
                )}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all relative overflow-hidden group"
                disabled={isSubmitting}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </form>
            {/* Enhanced Comments List */}
            <div
              className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
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
                    className="p-3 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                        {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-200 truncate">
                            {comment.user?.username || "Unknown"}
                          </span>
                          <AnimatePresence initial={false}>
                            <motion.div
                              key={
                                expandedComments[comment._id]
                                  ? "expanded"
                                  : "collapsed"
                              }
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden w-full"
                            >
                              <p className="text-gray-300 break-words whitespace-pre-line">
                                {expandedComments[comment._id]
                                  ? comment.text
                                  : `${comment.text.slice(0, 150)}...`}
                              </p>
                            </motion.div>
                          </AnimatePresence>
                          {comment.text.length > 150 && (
                            <button
                              onClick={() => toggleComment(comment._id)}
                              className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-1 transition-colors"
                            >
                              {expandedComments[comment._id]
                                ? "Show less"
                                : "Show more"}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
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
