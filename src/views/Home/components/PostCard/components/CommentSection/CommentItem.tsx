import React from 'react';
import moment from 'moment';
import { ADMIN_AVATAR_URL } from '@/components/PostCard/constants';
import { getAvatarColor } from '../../../../utils/avatarColor';

const MAX_COMMENT_LENGTH = 150;

const CommentItem = ({ comment, isExpanded, onToggleExpand }) => {
  const shouldShowExpand = comment.text.length > MAX_COMMENT_LENGTH;

  return (
    <div className="flex items-start gap-3 rounded-[3px] bg-[#f6efe0] p-3 shadow-[0_2px_0_rgba(60,44,24,.1)]">
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full font-paper-serif text-xs font-bold text-[var(--paper-cream)]"
        style={{ backgroundColor: getAvatarColor(comment.user?.username) }}
      >
        {comment.user?.isAdmin ? (
          <img src={ADMIN_AVATAR_URL} alt="" className="h-full w-full object-cover" />
        ) : (
          comment.user?.username?.charAt(0).toUpperCase() || 'U'
        )}
      </span>
      <div className="min-w-0 flex-1">
        <span className="truncate text-sm font-bold">{comment.user?.username || 'Unknown'}</span>
        <p className="mt-[3px] whitespace-pre-line break-words text-[15px] text-[var(--paper-muted)]">
          {isExpanded || comment.text.length <= MAX_COMMENT_LENGTH
            ? comment.text
            : `${comment.text.slice(0, MAX_COMMENT_LENGTH)}...`}
        </p>
        {shouldShowExpand && (
          <button
            onClick={onToggleExpand}
            className="mt-1 text-sm font-medium text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
            type="button"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <p className="mt-2 font-paper-mono text-[10px] tracking-[.12em] text-[var(--paper-muted-2)]">
          {moment.utc(comment.createdAt).local().fromNow()}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
