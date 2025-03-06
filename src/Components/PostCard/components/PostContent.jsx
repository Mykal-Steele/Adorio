import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_PREVIEW_LENGTH } from "../constants";

// handles the main post text and that cool expand/collapse thing
const PostContent = ({ title, content = "", isExpanded, onToggleExpand }) => {
  // making sure content isn't null or undefined
  const safeContent = content || "";
  const shouldShowExpand = safeContent.length > MAX_PREVIEW_LENGTH;

  // truncate long posts so the feed doesn't get super cluttered
  const displayContent =
    isExpanded || !shouldShowExpand
      ? safeContent
      : safeContent.slice(0, MAX_PREVIEW_LENGTH) + "...";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-100">{title || "Untitled"}</h2>
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

        {/* only show this button for long posts */}
        {shouldShowExpand && !isExpanded && (
          <button
            onClick={onToggleExpand}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 transition-colors"
            type="button"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
};

export default PostContent;
