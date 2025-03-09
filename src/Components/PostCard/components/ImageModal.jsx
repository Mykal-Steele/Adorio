import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

// image popup thingy when you click pics - animations are kinda sick ngl
const ImageModal = ({ isVisible, imageUrl, title, onClose, instanceId }) => {
  if (!isVisible || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`modal-${instanceId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* container for the image with that cool zoom-in effect */}
        <motion.div
          className="relative max-w-full max-h-full rounded-2xl overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={title || "Post image"}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          {/* close button with hover effect - took me a while to get this positioned right */}
          <button
            className="absolute top-4 right-4 p-2 bg-gray-900/80 backdrop-blur-lg rounded-full hover:bg-gray-800/60 transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            type="button"
          >
            <XMarkIcon className="h-6 w-6 text-gray-200 group-hover:text-purple-400" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;
