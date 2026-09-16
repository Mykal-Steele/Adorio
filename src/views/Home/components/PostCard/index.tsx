import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { addComment } from '@/api';
import { useImageLoader } from '@/components/PostCard/hooks/useImageLoader';
import ImageModal from '@/components/PostCard/components/ImageModal';
import type { ApiClientError } from '@/utils/errorHandling';

import AuthorHeader from './AuthorHeader';
import PostImage from './PostImage';
import PostContent from './PostContent';
import InteractionButtons from './InteractionButtons';
import CommentSection from './components/CommentSection';
import { getEffectiveParent } from './components/CommentSection/utils/commentTree';

const ROTATIONS = [
  'rotate-[0.4deg]',
  'rotate-[-0.5deg]',
  'rotate-[-0.3deg]',
  'rotate-[0.5deg]',
  'rotate-[-0.6deg]',
  'rotate-[0.7deg]',
];

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
  currentUsername,
  index = 0,
}) => {
  const instanceId = useMemo(
    () => `post-${_id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    [_id],
  );

  const isAdmin = user?.isAdmin === true;
  const rotationClass = ROTATIONS[index % ROTATIONS.length];
  const showTape = index % 3 !== 2;

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(() =>
    Array.isArray(initialComments) ? initialComments : [],
  );
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(
    Array.isArray(likes) ? likes.length : 0,
  );
  // Always start as false (matches SSR), synced after auth loads via useEffect
  const [optimisticUserLiked, setOptimisticUserLiked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const likeInProgressRef = useRef(false);
  const hasInteractedRef = useRef(false);

  // Sync liked state when currentUserId first becomes available (after auth bootstrap)
  useEffect(() => {
    if (currentUserId && !hasInteractedRef.current) {
      setOptimisticUserLiked(
        Array.isArray(likes) &&
          likes.some(
            (like) => (like?._id?.toString() || like?.toString()) === currentUserId.toString(),
          ),
      );
      setOptimisticLikesCount(Array.isArray(likes) ? likes.length : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const { imageState } = useImageLoader({ postImage, postId: _id, instanceId });

  const handleImageClick = useCallback(() => {
    if (imageState.isLoaded && !imageState.hasError && imageState.url) {
      setShowImageModal(true);
    }
  }, [imageState]);

  const handleToggleContent = useCallback(() => {
    setIsContentExpanded((prev) => !prev);
  }, []);

  const handleLike = useCallback(async () => {
    const willBeLiked = !optimisticUserLiked;

    if (likeInProgressRef.current) return;
    likeInProgressRef.current = true;
    hasInteractedRef.current = true;

    const buttonElement = document.querySelector(`[data-post-id="${_id}"] .like-button`);
    if (buttonElement) {
      buttonElement.classList.add('processing-like');
    }

    setOptimisticUserLiked(willBeLiked);
    setOptimisticLikesCount((prev) => (willBeLiked ? prev + 1 : prev - 1));

    try {
      if (typeof onLike === 'function') {
        const response = await onLike(_id, willBeLiked);

        if (response && Array.isArray(response.likes)) {
          const serverHasUserLike = response.likes.some(
            (like) => (like?._id?.toString() || like?.toString()) === currentUserId?.toString(),
          );

          // Server is authoritative — apply it even if it matches the pre-click
          // state (this closure's optimisticUserLiked is the value from before
          // the optimistic update, not the willBeLiked value just applied).
          setOptimisticUserLiked(serverHasUserLike);
          setOptimisticLikesCount(response.likes.length);
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error liking post:', err);
      }
      const errStatus = (err as ApiClientError)?.statusCode;
      if (errStatus === 401 || errStatus === 403) {
        setAuthError('Please log in to like posts.');
      } else {
        setAuthError('Failed to like. Please try again.');
      }
      setTimeout(() => setAuthError(null), 3000);
      // Revert optimistic update on error
      setOptimisticUserLiked(!willBeLiked);
      setOptimisticLikesCount((prev) => (willBeLiked ? prev - 1 : prev + 1));
    } finally {
      if (buttonElement) {
        buttonElement.classList.remove('processing-like');
      }
      setTimeout(() => {
        likeInProgressRef.current = false;
      }, 300);
    }
  }, [optimisticUserLiked, _id, onLike, currentUserId]);

  const handleCommentSubmit = useCallback(
    async (commentText: string, opts: { parentId: string | null; mentions: string[] }) => {
      const text = commentText?.trim();
      if (!text) return;

      const { parentId = null, depth } = opts.parentId
        ? getEffectiveParent(comments, opts.parentId)
        : { parentId: null, depth: 0 };
      const tempId = `temp-${Date.now()}`;
      const tempComment = {
        _id: tempId,
        text,
        user: { username: currentUsername || 'You', _id: currentUserId },
        createdAt: new Date().toISOString(),
        parentId,
        depth,
      };

      setComments((prevComments) => [
        ...(Array.isArray(prevComments) ? prevComments : []),
        tempComment,
      ]);

      try {
        const updatedPost = await addComment(_id, text, opts);

        if (updatedPost?.comments) {
          setComments(updatedPost.comments);
          if (typeof onCommentAdded === 'function') {
            onCommentAdded(updatedPost);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error adding comment:', err);
        }
        const errStatus = (err as ApiClientError)?.statusCode;
        if (errStatus === 401 || errStatus === 403) {
          setAuthError('Please log in to comment.');
          setTimeout(() => setAuthError(null), 3000);
        }
        setComments((prevComments) =>
          Array.isArray(prevComments)
            ? prevComments.filter((comment) => comment._id !== tempId)
            : [],
        );
        throw err;
      }
    },
    [_id, comments, currentUsername, currentUserId, onCommentAdded],
  );

  const safeImageUrl = useMemo(
    () =>
      imageState?.isLoaded && !imageState?.hasError && imageState?.url ? imageState.url : null,
    [imageState],
  );

  const commentsCount = Array.isArray(comments) ? comments.length : 0;

  if (!_id) return null;

  return (
    <article
      className={`relative mb-[clamp(24px,3vw,38px)] break-inside-avoid rounded-[3px] bg-[var(--paper-cream)] p-[clamp(22px,2.6vw,30px)] shadow-[0_16px_30px_-18px_rgba(60,44,24,.4),0_2px_0_rgba(60,44,24,.1)] ${rotationClass}`}
      data-post-id={_id}
    >
      {showTape && (
        <span
          aria-hidden="true"
          className="absolute -top-[11px] right-6 h-6 w-20 rotate-[4deg] border-x border-dashed border-[rgba(60,44,24,.28)] bg-[rgba(253,250,243,.9)] shadow-[0_1px_3px_rgba(60,44,24,.22)]"
        />
      )}

      <AuthorHeader user={user} createdAt={createdAt} isAdmin={isAdmin} />

      <div className="mt-5">
        <PostContent
          title={title}
          content={content}
          isExpanded={isContentExpanded}
          onToggleExpand={handleToggleContent}
        />
      </div>

      {postImage && (
        <PostImage
          imageState={imageState}
          onImageClick={handleImageClick}
          title={title}
          postId={_id}
          rotationClass={index % 2 === 0 ? 'rotate-[-0.7deg]' : 'rotate-[0.6deg]'}
        />
      )}

      <ImageModal
        isVisible={showImageModal}
        imageUrl={safeImageUrl}
        title={title}
        onClose={() => setShowImageModal(false)}
        instanceId={instanceId}
      />

      <InteractionButtons
        userLiked={optimisticUserLiked}
        likesCount={optimisticLikesCount}
        commentsCount={commentsCount}
        commentsOpen={showComments}
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
      />

      {authError && <p className="mt-2 text-sm text-[#8d3a33]">{authError}</p>}

      <CommentSection
        visible={showComments}
        comments={comments || []}
        onClose={() => setShowComments(false)}
        onSubmitComment={handleCommentSubmit}
      />
    </article>
  );
};

// this stops cards from re-rendering every time anything changes
const areEqual = (prevProps, nextProps) => {
  if (
    prevProps._id !== nextProps._id ||
    prevProps.title !== nextProps.title ||
    prevProps.content !== nextProps.content ||
    prevProps.createdAt !== nextProps.createdAt ||
    prevProps.currentUserId !== nextProps.currentUserId ||
    prevProps.currentUsername !== nextProps.currentUsername ||
    prevProps.index !== nextProps.index
  ) {
    return false;
  }

  if (
    prevProps.image?.url !== nextProps.image?.url ||
    prevProps.image?.public_id !== nextProps.image?.public_id
  ) {
    return false;
  }

  if ((prevProps.likes?.length || 0) !== (nextProps.likes?.length || 0)) {
    return false;
  }

  if ((prevProps.comments?.length || 0) !== (nextProps.comments?.length || 0)) {
    return false;
  }

  return true;
};

export default React.memo(PostCard, areEqual);
