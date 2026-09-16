import React, { useMemo, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CommentForm from './CommentForm';
import CommentItem from './components/CommentItem';
import { buildCommentTree } from './utils/commentTree';
import useMentionAutocomplete from './hooks/useMentionAutocomplete';

interface ReplyTarget {
  id: string;
  username: string;
}

interface CommentSectionProps {
  visible: boolean;
  comments: Array<{
    _id: string;
    text: string;
    user?: { _id?: string; username?: string; isAdmin?: boolean } | null;
    createdAt: string;
    parentId?: string | null;
    depth?: number;
  }>;
  onClose: () => void;
  onSubmitComment: (
    text: string,
    opts: { parentId: string | null; mentions: string[] },
  ) => Promise<void>;
}

const CommentSection = ({ visible, comments, onClose, onSubmitComment }: CommentSectionProps) => {
  const [draft, setDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    suggestions,
    activeIndex,
    mentionOpen,
    setActiveIndex,
    applySuggestion,
    handleMentionKeyDown,
    syncMentionTrigger,
    resolveMentionIds,
    resetMentions,
  } = useMentionAutocomplete(inputRef, draft, setDraft);

  const thread = useMemo(() => buildCommentTree(comments), [comments]);

  if (!visible) return null;

  const handleReply = (commentId: string, username: string) => {
    setReplyTarget({ id: commentId, username });
    setDraft((prev) => (prev.trim() === '' ? `@${username} ` : prev));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelReply = () => {
    setReplyTarget((target) => {
      if (target) {
        setDraft((prev) => prev.replace(new RegExp(`^@${target.username}\\s`), ''));
      }
      return null;
    });
    resetMentions();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitComment(text, {
        parentId: replyTarget?.id ?? null,
        mentions: resolveMentionIds(text),
      });
      setDraft('');
      setReplyTarget(null);
      resetMentions();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setDraft((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

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

      {replyTarget && (
        <p className="mb-2 text-sm text-[var(--paper-muted)]">
          Replying to{' '}
          <span className="font-bold text-[var(--paper-accent)]">@{replyTarget.username}</span>{' '}
          <button
            type="button"
            onClick={cancelReply}
            className="ml-1 font-medium underline hover:text-[var(--paper-ink)]"
          >
            Cancel
          </button>
        </p>
      )}

      <CommentForm
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        showEmojiPicker={showEmojiPicker}
        onToggleEmojiPicker={setShowEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        inputRef={inputRef}
        onInputKeyDown={handleMentionKeyDown}
        onInputSync={syncMentionTrigger}
        mentionOpen={mentionOpen}
        suggestions={suggestions}
        activeSuggestion={activeIndex}
        onSelectSuggestion={applySuggestion}
        onHoverSuggestion={setActiveIndex}
      />

      <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
        {thread.map((node) => (
          <CommentItem key={node.comment._id} node={node} onReply={handleReply} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
