import React, { useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const CommentSection = ({
  visible,
  comments,
  newComment,
  isSubmitting,
  showEmojiPicker,
  expandedComments,
  onClose,
  onSubmit,
  onChangeComment,
  onToggleEmojiPicker,
  onEmojiSelect,
  onCommentToggle,
}) => {
  const sortedComments = useMemo(() => {
    if (!Array.isArray(comments)) return [];
    return [...comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [comments]);

  if (!visible) return null;

  return (
    <div className="relative mt-5 border-t border-dashed border-[var(--paper-line)] pt-5">
      <button
        className="absolute -top-3 right-0 rounded-full bg-[var(--paper-cream)] p-1.5 shadow-[0_2px_0_rgba(60,44,24,.15)] hover:bg-[var(--paper-yellow-soft)]"
        onClick={onClose}
        type="button"
        aria-label="Hide comments"
      >
        <XMarkIcon className="h-4 w-4 text-[var(--paper-ink)]" />
      </button>

      <CommentForm
        value={newComment}
        onChange={onChangeComment}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        showEmojiPicker={showEmojiPicker}
        onToggleEmojiPicker={onToggleEmojiPicker}
        onEmojiSelect={onEmojiSelect}
      />

      <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
        {sortedComments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            isExpanded={expandedComments[comment._id]}
            onToggleExpand={() => onCommentToggle(comment._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
