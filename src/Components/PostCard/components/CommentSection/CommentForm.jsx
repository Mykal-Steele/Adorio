import React, { useRef } from "react";
import { motion } from "framer-motion";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import useClickOutside from "../../../../hooks/useClickOutside";

// this form handles all the comment input stuff - finally got emojis working!
const CommentForm = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  showEmojiPicker,
  onToggleEmojiPicker,
  onEmojiSelect,
}) => {
  const emojiPickerRef = useRef(null);
  // using my custom hook to close the emoji picker when clicking outside
  useClickOutside(emojiPickerRef, () => onToggleEmojiPicker(false));

  return (
    <form onSubmit={onSubmit} className="mb-4">
      <motion.div whileFocus={{ scale: 1.02 }} className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 text-gray-300 bg-gray-800/50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 outline-none"
        />
        {/* emoji button - tried to make it look like fb's */}
        <button
          type="button"
          onClick={() => onToggleEmojiPicker(!showEmojiPicker)}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
        >
          😊
        </button>

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-16 right-0 z-50">
            <Picker
              data={data}
              onEmojiSelect={onEmojiSelect}
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

      {/* added this cool hover effect i saw on dribbble */}
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
        {/* this overlay gives that subtle shine effect when hovering */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </form>
  );
};

export default CommentForm;
