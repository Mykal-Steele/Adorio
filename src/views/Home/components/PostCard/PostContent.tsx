import React from 'react';
import DOMPurify from 'dompurify';
import { MAX_PREVIEW_LENGTH } from '@/components/PostCard/constants';

// DOMPurify only works in the browser (it needs a DOM)
const sanitize = (str) => {
  if (typeof window === 'undefined') return str || '';
  return DOMPurify.sanitize(str || '');
};

const PostContent = ({ title, content = '', isExpanded, onToggleExpand }) => {
  const safeContent = content || '';
  const shouldShowExpand = safeContent.length > MAX_PREVIEW_LENGTH;

  const displayContent =
    isExpanded || !shouldShowExpand
      ? safeContent
      : safeContent.slice(0, MAX_PREVIEW_LENGTH) + '...';

  const sanitizedTitle = sanitize(title || 'Untitled');
  const sanitizedDisplayContent = sanitize(displayContent);

  return (
    <div>
      <h3
        className="mb-[10px] font-paper-serif text-[clamp(23px,2.4vw,28px)] font-bold leading-[1.14] tracking-[-.01em]"
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
      />
      <p
        className="whitespace-pre-line break-words text-base leading-[1.62] text-[var(--paper-muted)]"
        dangerouslySetInnerHTML={{ __html: sanitizedDisplayContent }}
      />
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
