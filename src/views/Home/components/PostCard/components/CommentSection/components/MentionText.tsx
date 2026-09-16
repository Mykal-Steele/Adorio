import React from 'react';

const MENTION_PATTERN = /(^|[\s(])@([a-zA-Z0-9_]{3,20})/g;

const MentionText = ({ text }: { text: string }) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MENTION_PATTERN.lastIndex = 0;

  while ((match = MENTION_PATTERN.exec(text)) !== null) {
    const [full, prefix, username] = match;
    const atIndex = match.index + prefix.length;
    if (match.index > lastIndex || prefix) {
      parts.push(text.slice(lastIndex, atIndex));
    }
    parts.push(
      <span key={atIndex} className="font-bold text-[var(--paper-accent)]">
        @{username}
      </span>,
    );
    lastIndex = atIndex + full.length - prefix.length;
  }
  parts.push(text.slice(lastIndex));
  return <>{parts}</>;
};

export default MentionText;
