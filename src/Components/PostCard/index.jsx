import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { addComment } from "../../api";

import AuthorHeader from "./components/AuthorHeader";
import PostImage from "./components/PostImage";
import ImageModal from "./components/ImageModal";
import PostContent from "./components/PostContent";
import InteractionButtons from "./components/InteractionButtons";
import CommentSection from "./components/CommentSection";

// Import hooks
import { useImageLoader } from "./hooks/useImageLoader";

import { isUserAdmin } from "./constants";

import { XMarkIcon } from "@heroicons/react/24/outline";

const PostCard = ({
  _id,
  title,
  content,
  user,
  image: postImage,
  likes = [],
  comments: initialComments = [],
  createdAt,
  onCommentAdded,
  onLike,
  currentUserId,
}) => {
  // random id so framer-motion doesn't break animations when react decides to rerender stuff
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

  // refs so we don't mess up state with like button spam
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

      // optimistic update still works
      setComments((prevComments) => [
        tempComment,
        ...(Array.isArray(prevComments) ? prevComments : []),
      ]);

      const commentText = newComment;
      setNewComment("");

      setIsSubmitting(true);
      try {
        const updatedPost = await addComment(_id, commentText);

        // make sure we're actually getting populated comments with user data
        if (updatedPost?.comments) {
          // replace all comments with the properly populated ones
          setComments(updatedPost.comments);
          if (typeof onCommentAdded === "function") {
            onCommentAdded(updatedPost);
          }
        }
      } catch (err) {
        // had to handle this error myself since the backend wasn't great at it
        console.error("Error adding comment:", err);
        setComments((prevComments) =>
          Array.isArray(prevComments)
            ? prevComments.filter((comment) => comment._id !== tempId)
            : []
        );
        setNewComment(commentText);
      } finally {
        setIsSubmitting(false);
      }
    },
    [_id, newComment, isSubmitting, user, currentUserId, onCommentAdded]
  );

  // making sure we don't try to show broken images in the modal
  const safeImageUrl = useMemo(
    () =>
      imageState?.isLoaded && !imageState?.hasError && imageState?.url
        ? imageState.url
        : null,
    [imageState]
  );

  // make sure comments.length doesn't explode if comments is null
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

// this stops cards from re-rendering every time anything changes
const areEqual = (prevProps, nextProps) => {
  // compare primitive props
  if (
    prevProps._id !== nextProps._id ||
    prevProps.title !== nextProps.title ||
    prevProps.content !== nextProps.content ||
    prevProps.createdAt !== nextProps.createdAt ||
    prevProps.currentUserId !== nextProps.currentUserId
  ) {
    return false;
  }

  // Compare image props
  if (
    prevProps.image?.url !== nextProps.image?.url ||
    prevProps.image?.public_id !== nextProps.image?.public_id
  ) {
    return false;
  }

  // Compare likes length
  if ((prevProps.likes?.length || 0) !== (nextProps.likes?.length || 0)) {
    return false;
  }

  // Compare comments length
  if ((prevProps.comments?.length || 0) !== (nextProps.comments?.length || 0)) {
    return false;
  }

  return true;
};

export default React.memo(PostCard, areEqual);
