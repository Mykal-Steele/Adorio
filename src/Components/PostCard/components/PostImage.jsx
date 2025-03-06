import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

// image component that handles all the loading states - finally got this right
const PostImage = ({ imageState, onImageClick, title, postId, instanceId }) => {
  const imageRef = useRef(null);

  if (!imageState) return null;

  return (
    <motion.div
      key={`img-${instanceId}`}
      className="mb-4 rounded-xl overflow-hidden relative cursor-pointer"
      whileHover={{ scale: 1.01 }}
    >
      <button
        onClick={onImageClick}
        className="w-full h-full block relative group"
        disabled={!imageState.isLoaded || imageState.hasError}
        type="button"
      >
        {/* spinner while image loads - looks way better than empty space */}
        {imageState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* error message if cloudinary fails or something */}
        {imageState.hasError && !imageState.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/30">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-xs text-gray-400 mt-2">Image failed to load</p>
          </div>
        )}

        {/* actual image with that hover overlay thing i added */}
        {imageState.isLoaded && imageState.url && (
          <React.Fragment>
            <img
              ref={imageRef}
              src={imageState.url}
              alt={title || "Post image"}
              className="w-full h-auto max-h-[600px] object-cover"
              loading="lazy"
              style={{ aspectRatio: "2 / 1.1" }}
              data-post-id={postId}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ArrowsPointingOutIcon className="absolute top-3 right-3 h-6 w-6 text-white opacity-0 group-hover:opacity-75 transition-opacity" />
          </React.Fragment>
        )}
      </button>
    </motion.div>
  );
};

export default PostImage;
