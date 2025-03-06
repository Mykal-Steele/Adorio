import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { addComment } from "../../api";

// Import components
import AuthorHeader from "./components/AuthorHeader";
import PostImage from "./components/PostImage";
import ImageModal from "./components/ImageModal";
import PostContent from "./components/PostContent";
import InteractionButtons from "./components/InteractionButtons";
import CommentSection from "./components/CommentSection";

// Import hooks
import { useImageLoader } from "./hooks/useImageLoader";

// Import constants
import { isUserAdmin } from "./constants";

import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  XMarkIcon, // Add this import
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const PostCard = ({
  _id,
  title,
  content,
  user,
  image: postImage,
  likes = [], // Ensure default value
  comments: initialComments = [], // Ensure default value
  createdAt,
  onCommentAdded,
  onLike,
  currentUserId,
}) => {
  // Create a unique ID for this post instance
  const instanceId = useMemo(
    () =>
      `post-${_id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    [_id]
  );

  // Derived states with safety checks
  const isAdmin = user?.username === "Admin";
  const userLiked =
    Array.isArray(likes) &&
    likes.some(
      (like) =>
        (like?._id?.toString() || like?.toString()) ===
        currentUserId?.toString()
    );

  // Component state
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]); // Initialize comments state from props, but don't try to keep in sync
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsScrollTop, setCommentsScrollTop] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(
    Array.isArray(likes) ? likes.length : 0 // Add safety
  );
  const [optimisticUserLiked, setOptimisticUserLiked] = useState(userLiked);

  // Add this ref to track optimistic updates
  const isOptimisticUpdateRef = useRef(false);
  const likeInProgressRef = useRef(false);

  // Load image
  const { imageState } = useImageLoader({
    postImage,
    postId: _id,
    instanceId,
  });

  // Update comments only once when component mounts or when ID changes
  useEffect(() => {
    if (Array.isArray(initialComments)) {
      setComments(initialComments);
    }
  }, [_id]); // Only re-run if post ID changes

  // Track if this is the first mount
  const isFirstRender = useRef(true);

  // Only update likes from props on initial mount, not during updates
  useEffect(() => {
    // Only run this effect once on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (Array.isArray(likes)) {
        setOptimisticLikesCount(likes.length);
        setOptimisticUserLiked(
          likes.some(
            (like) =>
              (like?._id?.toString() || like?.toString()) ===
              currentUserId?.toString()
          )
        );
      }
    }
  }, []); // Empty dependency array - only runs once on mount

  // Handle image click
  const handleImageClick = useCallback(() => {
    if (imageState.isLoaded && !imageState.hasError && imageState.url) {
      setShowImageModal(true);
    }
  }, [imageState]);

  // Handle content toggle
  const handleToggleContent = useCallback(() => {
    setIsContentExpanded((prev) => !prev);
    if (!isContentExpanded) {
      requestAnimationFrame(() =>
        window.scrollTo({ top: window.scrollY + 50, behavior: "smooth" })
      );
    }
  }, [isContentExpanded]);

  // Handle comment toggle
  const handleToggleComment = useCallback((commentId) => {
    setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  }, []);

  // Replace the current handleLike function

  const handleLike = useCallback(async () => {
    // Get the target state (opposite of current state)
    const willBeLiked = !optimisticUserLiked;

    // Prevent multiple clicks if a like is already in progress
    if (likeInProgressRef.current) return;
    likeInProgressRef.current = true;

    // Add the processing class to show animation - KEEP ONLY THIS INSTANCE
    const buttonElement = document.querySelector(
      `[data-post-id="${_id}"] .like-button`
    );
    if (buttonElement) {
      buttonElement.classList.add("processing-like");
    }

    // Update UI optimistically right away
    setOptimisticUserLiked(willBeLiked);
    setOptimisticLikesCount((prev) => (willBeLiked ? prev + 1 : prev - 1));

    try {
      // Pass the intended state to the API function
      if (typeof onLike === "function") {
        const response = await onLike(_id, willBeLiked);

        // Ensure our UI reflects the server state (reconciliation)
        if (response && Array.isArray(response.likes)) {
          const serverHasUserLike = response.likes.some(
            (like) =>
              (like?._id?.toString() || like?.toString()) ===
              currentUserId?.toString()
          );

          // Only update UI if it differs from server state
          if (serverHasUserLike !== optimisticUserLiked) {
            setOptimisticUserLiked(serverHasUserLike);
            setOptimisticLikesCount(response.likes.length);
          }
        }

        console.log(
          `Like operation completed - Server state: ${
            willBeLiked ? "liked" : "unliked"
          }`
        );
      }
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert optimistic update on error
      setOptimisticUserLiked(!willBeLiked);
      setOptimisticLikesCount((prev) => (willBeLiked ? prev - 1 : prev + 1));
    } finally {
      // Remove processing indicator
      if (buttonElement) {
        buttonElement.classList.remove("processing-like");
      }
      // Reset the in-progress flag with a small delay
      setTimeout(() => {
        likeInProgressRef.current = false;
      }, 300);
    }
  }, [optimisticUserLiked, _id, onLike, currentUserId]);

  // Handle emoji select
  const handleEmojiSelect = useCallback((emoji) => {
    setNewComment((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  }, []);

  // Handle comment submit
  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newComment?.trim() || isSubmitting) return;

      // Create a temporary comment with timestamp as ID
      const tempId = `temp-${Date.now()}`;
      const tempComment = {
        _id: tempId,
        text: newComment,
        user: {
          username: user?.username || "You",
          _id: currentUserId,
        },
        createdAt: new Date().toISOString(),
      };

      // Optimistically add comment to UI immediately
      setComments((prevComments) => [
        tempComment,
        ...(Array.isArray(prevComments) ? prevComments : []),
      ]);

      // Clear input field right away
      const commentText = newComment;
      setNewComment("");

      setIsSubmitting(true);
      try {
        const updatedPost = await addComment(_id, commentText);
        // Replace temporary comments with actual data from server
        if (updatedPost?.comments) {
          setComments(updatedPost.comments);
          if (typeof onCommentAdded === "function") {
            onCommentAdded(updatedPost);
          }
        }
      } catch (err) {
        console.error("Error adding comment:", err);
        // Remove the temporary comment if there was an error
        setComments((prevComments) =>
          Array.isArray(prevComments)
            ? prevComments.filter((comment) => comment._id !== tempId)
            : []
        );
        // Restore the comment text to the input
        setNewComment(commentText);
      } finally {
        setIsSubmitting(false);
      }
    },
    [_id, newComment, isSubmitting, user, currentUserId, onCommentAdded]
  );

  // Safe image URL for modal
  const safeImageUrl = useMemo(
    () =>
      imageState?.isLoaded && !imageState?.hasError && imageState?.url
        ? imageState.url
        : null,
    [imageState]
  );

  // Safely get comments length
  const commentsCount = Array.isArray(comments) ? comments.length : 0;

  // If no valid post ID, don't render
  if (!_id) return null;

  return (
    <motion.div
      key={instanceId}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 bg-gray-900/80 backdrop-blur-md rounded-xl shadow-xl transition-all relative group hover:bg-gray-900/90"
      data-post-id={_id}
    >
      {/* Author Header */}
      <AuthorHeader user={user} createdAt={createdAt} isAdmin={isAdmin} />

      {/* Post Image */}
      {postImage && (
        <PostImage
          imageState={imageState}
          onImageClick={handleImageClick}
          title={title}
          postId={_id}
          instanceId={instanceId}
        />
      )}

      {/* Image Modal */}
      <ImageModal
        isVisible={showImageModal}
        imageUrl={safeImageUrl}
        title={title}
        onClose={() => setShowImageModal(false)}
        instanceId={instanceId}
      />
      {/* Close modal button - this is only shown when showImageModal is true */}
      {showImageModal && (
        <button
          className="absolute top-4 right-4 p-2 bg-gray-900/80 backdrop-blur-lg rounded-full hover:bg-gray-800/60 transition-colors group"
          onClick={() => setShowImageModal(false)}
          aria-label="Close image preview"
        >
          <XMarkIcon className="h-6 w-6 text-gray-200 group-hover:text-purple-400" />
        </button>
      )}

      {/* Post Content */}
      <PostContent
        title={title}
        content={content}
        isExpanded={isContentExpanded}
        onToggleExpand={handleToggleContent}
      />

      {/* Show more/less content */}
      {content.length > 150 && (
        <button
          onClick={handleToggleContent}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 transition-colors"
          aria-label={
            isContentExpanded ? "Show less content" : "Show more content"
          }
        >
          {isContentExpanded ? "Show less" : "Show more"}
        </button>
      )}

      {/* Interaction Buttons */}
      <InteractionButtons
        userLiked={optimisticUserLiked}
        likesCount={optimisticLikesCount}
        commentsCount={commentsCount} // Use the safe count
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
      />

      {/* Comments Section */}
      <CommentSection
        visible={showComments}
        comments={comments || []} // Ensure array
        newComment={newComment}
        isSubmitting={isSubmitting}
        showEmojiPicker={showEmojiPicker}
        scrollTop={commentsScrollTop}
        expandedComments={expandedComments}
        onClose={() => setShowComments(false)}
        onSubmit={handleCommentSubmit}
        onChangeComment={setNewComment}
        onToggleEmojiPicker={setShowEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        onCommentToggle={handleToggleComment}
        onScroll={(e) => setCommentsScrollTop(e?.target?.scrollTop || 0)}
      />
    </motion.div>
  );
};

// Improved comparison function for React.memo
const areEqual = (prevProps, nextProps) => {
  // Fast equality check for primitive props
  if (
    prevProps._id !== nextProps._id ||
    prevProps.title !== nextProps.title ||
    prevProps.content !== nextProps.content ||
    prevProps.createdAt !== nextProps.createdAt ||
    prevProps.currentUserId !== nextProps.currentUserId
  ) {
    return false;
  }

  // Deep comparison for arrays
  if (
    prevProps.likes?.length !== nextProps.likes?.length ||
    !prevProps.likes?.every(
      (like, i) =>
        (like?._id?.toString() || like?.toString()) ===
        (nextProps.likes[i]?._id?.toString() || nextProps.likes[i]?.toString())
    )
  ) {
    return false;
  }

  // Compare only comment length for performance if length is different
  if (prevProps.comments?.length !== nextProps.comments?.length) {
    return false;
  }

  // Only check comments with a fast equality check
  if (prevProps.comments !== nextProps.comments) {
    return false;
  }

  // If we get here, props are equal
  return true;
};

export default React.memo(PostCard, areEqual);
