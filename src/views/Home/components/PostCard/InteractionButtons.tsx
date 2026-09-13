import React from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const InteractionButtons = ({
  userLiked,
  likesCount,
  commentsCount,
  commentsOpen,
  onLike,
  onToggleComments,
}) => {
  return (
    <div className="mt-5 flex items-center gap-6 border-t border-dashed border-[var(--paper-line)] pt-4">
      <button
        onClick={onLike}
        className="like-button flex items-center gap-2 py-[5px] text-[15px] font-bold transition-transform hover:scale-105 active:scale-95"
        data-like-state={userLiked ? 'liked' : 'unliked'}
        aria-label={userLiked ? 'Unlike this post' : 'Like this post'}
        aria-pressed={userLiked}
        type="button"
      >
        {userLiked ? (
          <HeartIconSolid className="h-[17px] w-[17px] text-[#a9564f]" />
        ) : (
          <HeartIcon className="h-[17px] w-[17px] text-[var(--paper-muted-2)] transition-colors group-hover:text-[#a9564f]" />
        )}
        <span className={userLiked ? 'text-[#8d3a33]' : 'text-[var(--paper-muted-2)]'}>
          {likesCount}
        </span>
      </button>

      <button
        onClick={onToggleComments}
        className="flex items-center gap-2 py-[5px] text-[15px] font-medium transition-transform hover:scale-105 active:scale-95"
        aria-label={commentsOpen ? 'Hide comments' : 'Show comments'}
        aria-expanded={commentsOpen}
        type="button"
      >
        <ChatBubbleOvalLeftIcon className="h-[17px] w-[17px] text-[var(--paper-muted-2)]" />
        <span className="text-[var(--paper-muted-2)]">{commentsCount}</span>
      </button>
    </div>
  );
};

export default InteractionButtons;
