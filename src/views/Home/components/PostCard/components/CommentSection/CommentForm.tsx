import React, { useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import useClickOutside from '@/hooks/useClickOutside';

// this form handles all the comment input stuff
const CommentForm = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  showEmojiPicker,
  onToggleEmojiPicker,
  onEmojiSelect,
}) => {
  const emojiPickerRef = useRef(null);
  // using my custom hook to close the emoji picker when clicking outside
  useClickOutside(emojiPickerRef, () => onToggleEmojiPicker(false));

  return (
    <form onSubmit={onSubmit} className="mb-4 flex items-center gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border-b-[1.5px] border-[rgba(60,44,24,.4)] bg-transparent py-2 pr-8 text-[15px] outline-none focus:border-[var(--paper-accent-strong)]"
        />
        <button
          type="button"
          onClick={() => onToggleEmojiPicker(!showEmojiPicker)}
          className="absolute right-0 top-1.5 text-[var(--paper-muted-2)] hover:text-[var(--paper-ink)]"
        >
          😊
        </button>

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-50">
            <Picker
              data={data}
              onEmojiSelect={onEmojiSelect}
              theme="light"
              set="native"
              previewPosition="none"
              skinTonePosition="search"
              dynamicWidth={true}
              style={{
                width: '350px',
                height: '400px',
                borderRadius: '4px',
                boxShadow: '0 4px 20px rgba(60, 44, 24, 0.25)',
              }}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="shrink-0 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-4 py-2 font-paper-mono text-xs font-bold tracking-[.1em] shadow-[2px_2px_0_var(--paper-ink)] transition-transform hover:-translate-y-px disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? '...' : 'Post'}
      </button>
    </form>
  );
};

export default CommentForm;
