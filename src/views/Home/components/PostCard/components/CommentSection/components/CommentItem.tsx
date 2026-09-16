import React, { useState } from 'react';
import moment from 'moment';
import { ADMIN_AVATAR_URL } from '@/components/PostCard/constants';
import { THREAD_INDENT_PX } from '../../../../../constants/feed';
import { getVisualDepth, type ThreadNode } from '../utils/commentTree';
import MentionText from './MentionText';
import { getAvatarColor } from '../../../../../utils/avatarColor';

const MAX_COMMENT_LENGTH = 150;

interface CommentItemProps {
  node: ThreadNode;
  onReply: (commentId: string, username: string) => void;
}

const CommentItem = ({ node, onReply }: CommentItemProps) => {
  const { comment, children } = node;
  const [isExpanded, setIsExpanded] = useState(false);
  const depth = getVisualDepth(comment.depth);
  const username = comment.user?.username || 'Unknown';
  const shouldShowExpand = comment.text.length > MAX_COMMENT_LENGTH;
  const avatarSize = depth === 0 ? 30 : depth === 1 ? 28 : 26;

  return (
    <div style={depth > 0 ? { marginLeft: depth * THREAD_INDENT_PX } : undefined}>
      <div className="flex items-start gap-3 rounded-[3px] bg-[#f6efe0] p-3 shadow-[0_2px_0_rgba(60,44,24,.1)]">
        <span
          aria-hidden="true"
          className="grid shrink-0 place-items-center overflow-hidden rounded-full font-paper-serif font-bold text-[var(--paper-cream)]"
          style={{
            width: avatarSize,
            height: avatarSize,
            fontSize: depth === 0 ? 14 : 12,
            backgroundColor: getAvatarColor(username),
          }}
        >
          {comment.user?.isAdmin ? (
            <img src={ADMIN_AVATAR_URL} alt="" className="h-full w-full object-cover" />
          ) : (
            username.charAt(0).toUpperCase() || 'U'
          )}
        </span>
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-bold">{username}</span>
          <p className="mt-[3px] whitespace-pre-line break-words text-[15px] text-[var(--paper-muted)]">
            {isExpanded || comment.text.length <= MAX_COMMENT_LENGTH ? (
              <MentionText text={comment.text} />
            ) : (
              <MentionText text={`${comment.text.slice(0, MAX_COMMENT_LENGTH)}...`} />
            )}
          </p>
          {shouldShowExpand && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-1 text-sm font-medium text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
              type="button"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
          <div className="mt-2 flex items-center gap-3.5">
            <button
              onClick={() => onReply(comment._id, username)}
              className="font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)] hover:text-[var(--paper-accent)]"
              type="button"
            >
              Reply
            </button>
            <p className="font-paper-mono text-[10px] tracking-[.12em] text-[var(--paper-muted-2)]">
              {moment.utc(comment.createdAt).local().fromNow()}
            </p>
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {children.map((child) => (
            <CommentItem key={child.comment._id} node={child} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
