import React from 'react';

// image component that handles all the loading states
const PostImage = ({ imageState, onImageClick, title, postId, rotationClass }) => {
  if (!imageState) return null;

  return (
    <figure
      className={`relative mt-[22px] bg-[#f1e7d3] p-[10px] shadow-[0_2px_0_rgba(60,44,24,.12)] ${rotationClass}`}
    >
      <button
        onClick={onImageClick}
        className="group relative block aspect-[16/10] w-full overflow-hidden border border-[rgba(60,44,24,.22)]"
        disabled={!imageState.isLoaded || imageState.hasError}
        type="button"
      >
        {imageState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f1e7d3]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgba(60,44,24,.25)] border-t-[var(--paper-accent)]" />
          </div>
        )}

        {imageState.hasError && !imageState.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f1e7d3]">
            <svg
              className="h-8 w-8 text-[#8d3a33]"
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
            <p className="text-xs text-[var(--paper-muted-2)]">Image failed to load</p>
          </div>
        )}

        {imageState.isLoaded && imageState.url && (
          <>
            <img
              src={imageState.url}
              alt={title || 'Post image'}
              className="h-full w-full object-cover"
              loading="lazy"
              data-post-id={postId}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </>
        )}
      </button>
    </figure>
  );
};

export default PostImage;
