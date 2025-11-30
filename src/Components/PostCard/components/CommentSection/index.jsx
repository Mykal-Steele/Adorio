import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

// the slide-in comment section component - finally got this animation working!
const CommentSection = ({
  visible,
  comments,
  newComment,
  isSubmitting,
  showEmojiPicker,
  scrollTop,
  expandedComments,
  onClose,
  onSubmit,
  onChangeComment,
  onToggleEmojiPicker,
  onEmojiSelect,
  onCommentToggle,
  onScroll,
}) => {
  // sorting these once instead of a million times on every render
  const sortedComments = useMemo(() => {
    if (!Array.isArray(comments)) return [];
    return [...comments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [comments]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 pt-4 border-t border-gray-800/40 relative"
      >
        {/* close button that follows you when scrolling - took me 3hrs to figure this out */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: Math.min(scrollTop, 100) }}
          exit={{ opacity: 0 }}
          className="fixed md:absolute right-8 top-24 md:right-4 md:-top-4 z-50 p-2 bg-gray-800/80 backdrop-blur-lg rounded-full hover:bg-gray-700/60 transition-colors group"
          onClick={onClose}
          type="button"
        >
          {/* psst... developer... have you tried holding shift and clicking this button? nothing happens lol */}
          <XMarkIcon className="h-6 w-6 text-gray-200 group-hover:text-purple-400" />
        </motion.button>

        {/* comment form with emoji picker that i spent way too long on */}
        <CommentForm
          value={newComment}
          onChange={onChangeComment}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          showEmojiPicker={showEmojiPicker}
          onToggleEmojiPicker={onToggleEmojiPicker}
          onEmojiSelect={onEmojiSelect}
        />

        {/* comments with that sick scrollbar i copied from github */}
        <div
          className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
          onScroll={onScroll}
        >
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              isExpanded={expandedComments[comment._id]}
              onToggleExpand={() => onCommentToggle(comment._id)}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentSection;
