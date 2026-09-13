import React from 'react';
import { MAX_PREVIEW_LENGTH } from '@/components/PostCard/constants';

const PostContent = ({ title, content = '', isExpanded, onToggleExpand }) => {
  const safeContent = content || '';
  const shouldShowExpand = safeContent.length > MAX_PREVIEW_LENGTH;

  const displayContent =
    isExpanded || !shouldShowExpand
      ? safeContent
      : safeContent.slice(0, MAX_PREVIEW_LENGTH) + '...';

  return (
    <div>
      <h3 className="mb-[10px] font-paper-serif text-[clamp(23px,2.4vw,28px)] font-bold leading-[1.14] tracking-[-.01em]">
        {title || 'Untitled'}
      </h3>
      <p className="whitespace-pre-line break-words text-base leading-[1.62] text-[var(--paper-muted)]">
        {displayContent}
      </p>
      {shouldShowExpand && (
        <button
          onClick={onToggleExpand}
          className="mt-2 text-sm font-medium text-[var(--paper-accent)] transition-colors hover:text-[var(--paper-ink)]"
          type="button"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

export default PostContent;
