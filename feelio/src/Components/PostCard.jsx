import React, { useState } from "react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import moment from "moment";
import { addComment } from "../api";

const PostCard = ({
  id,
  title,
  content,
  author,
  likes = [],
  comments: initialComments = [],
  createdAt,
  onCommentAdded,
  onLike,
  onCloseComments,
  currentUserId,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Check if current user has liked the post
  const userLiked = likes.some((like) => like._id === currentUserId);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedPost = await addComment(id, newComment);
      setComments(updatedPost.comments);
      setNewComment("");
      onCommentAdded(updatedPost);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      await onLike(id);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const toggleContent = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    onCloseComments();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all relative">
      {/* Close Comments Button */}
      {showComments && (
        <button
          onClick={handleCloseComments}
          className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}

      {/* Author and Timestamp */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-gray-700 dark:text-gray-300">
              {author?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-semibold dark:text-white">{author}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {moment(createdAt).fromNow()}
            </p>
          </div>
        </div>
      </div>

      {/* Post Title and Content */}
      <h2 className="text-xl font-bold mb-2 dark:text-white">{title}</h2>
      <p
        className={`text-gray-700 dark:text-gray-300 mb-4 ${
          isContentExpanded ? "" : "line-clamp-3"
        }`}
      >
        {content}
      </p>
      {content.length > 150 && (
        <button
          onClick={toggleContent}
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          {isContentExpanded ? "See Less" : "See More"}
        </button>
      )}

      {/* Like and Comment Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleLike}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500"
        >
          {userLiked ? (
            <HeartIconSolid className="h-6 w-6 text-red-500" />
          ) : (
            <HeartIcon className="h-6 w-6" />
          )}
          <span className="ml-1">{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500"
        >
          <ChatBubbleOvalLeftIcon className="h-6 w-6" />
          <span className="ml-1">{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showComments ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          {comments
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((comment) => (
              <div key={comment._id} className="mb-4 last:mb-0">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm font-medium dark:text-white">
                        {comment.user?.username || "Unknown"}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                        {comment.text}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {moment(comment.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
