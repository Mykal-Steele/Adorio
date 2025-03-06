import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_PREVIEW_LENGTH } from "../constants";

const PostContent = ({ title, content = "", isExpanded, onToggleExpand }) => {
  // Add default value and safety check for content
  const safeContent = content || "";
  const shouldShowExpand = safeContent.length > MAX_PREVIEW_LENGTH;

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
