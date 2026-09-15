import { useEffect, useRef, useState } from 'react';

interface ConsoleOutputProps {
  content: string;
  minHeight?: number;
  maxInitialHeight?: number;
  maxHeight?: number;
}

const ConsoleOutput = ({
  content,
  minHeight = 60,
  maxInitialHeight = 220,
  maxHeight = 600,
}: ConsoleOutputProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const previousHeight = el.style.height;
    el.style.height = 'auto';
    const naturalHeight = el.scrollHeight;
    el.style.height = previousHeight;

    setHeight(Math.min(Math.max(naturalHeight, minHeight), maxInitialHeight));
  }, [content, minHeight, maxInitialHeight]);

  return (
    <div
      ref={ref}
      className="resize-y overflow-auto whitespace-pre-wrap rounded-[2px] border border-black/40 bg-[#1a1712] p-3 font-paper-mono text-[13px] leading-[1.6] text-[#c9c0a9]"
      style={{ height: `${height}px`, minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
    >
      {content}
    </div>
  );
};

export default ConsoleOutput;
