import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { ADMIN_AVATAR_URL, isUserAdmin } from "../../constants";

const CommentItem = ({ comment, isExpanded, onToggleExpand }) => {
  const MAX_COMMENT_LENGTH = 150;
  const shouldShowExpand = comment.text.length > MAX_COMMENT_LENGTH;

  return (
    <motion.div
      key={`comment-${comment._id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-3 bg-gray-800/50 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
          {isUserAdmin(comment.user?.username) ? (
            <img
              src={ADMIN_AVATAR_URL}
              alt="Admin Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-white">
              {comment.user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-200 truncate">
              {comment.user?.username || "Unknown"}
            </span>
            <AnimatePresence initial={false}>
              <motion.div
                key={isExpanded ? "expanded" : "collapsed"}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden w-full"
              >
                <p className="text-gray-300 break-words whitespace-pre-line">
                  {isExpanded || comment.text.length <= MAX_COMMENT_LENGTH
                    ? comment.text
                    : `${comment.text.slice(0, MAX_COMMENT_LENGTH)}...`}
                </p>
              </motion.div>
            </AnimatePresence>
            {shouldShowExpand && (
              <button
                onClick={onToggleExpand}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-1 transition-colors"
                type="button"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {moment(comment.createdAt).fromNow()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;
