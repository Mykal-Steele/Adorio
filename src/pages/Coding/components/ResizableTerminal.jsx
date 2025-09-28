import React, { useState, useEffect, useRef } from 'react';

/**
 * Resizable Terminal Component
 * Handles adaptive sizing based on content and allows user drag resizing
 */
const ResizableTerminal = ({
  content,
  className = '',
  minHeight = 60,
  maxInitialHeight = 250,
  maxHeight = 800,
}) => {
  const [height, setHeight] = useState(minHeight);
  const [isResizing, setIsResizing] = useState(false);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const isResizingRef = useRef(false);

  // Cleanup function
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('mouseup', () => {});
      document.removeEventListener('touchmove', () => {});
      document.removeEventListener('touchend', () => {});
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  // Calculate content height and set initial size
  useEffect(() => {
    if (contentRef.current && content) {
      const contentElement = contentRef.current;

      // Temporarily set height to auto to measure content
      const originalHeight = contentElement.style.height;
      contentElement.style.height = 'auto';

      // Get the natural content height
      const scrollHeight = contentElement.scrollHeight;

      // Restore original height
      contentElement.style.height = originalHeight;

      // Calculate optimal height (content + padding)
      const paddingAndBorder = 24; // 12px padding top + 12px padding bottom
      const optimalHeight = Math.min(
        Math.max(scrollHeight + paddingAndBorder, minHeight),
        maxInitialHeight
      );

      setHeight(optimalHeight);
    }
  }, [content, minHeight, maxInitialHeight]);

  // Mouse event handlers for resize functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    isResizingRef.current = true;
    startY.current = e.clientY;
    startHeight.current = height;

    // Add event listeners to document for better tracking
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      e.preventDefault();

      const deltaY = e.clientY - startY.current;
      const newHeight = Math.min(
        Math.max(startHeight.current + deltaY, minHeight),
        maxHeight
      );

      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    isResizingRef.current = true;
    startY.current = e.touches[0].clientY;
    startHeight.current = height;

    const handleTouchMove = (e) => {
      if (!isResizingRef.current) return;
      e.preventDefault();

      const deltaY = e.touches[0].clientY - startY.current;
      const newHeight = Math.min(
        Math.max(startHeight.current + deltaY, minHeight),
        maxHeight
      );

      setHeight(newHeight);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      isResizingRef.current = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        ref={contentRef}
        className='bg-gray-900/50 rounded border font-mono text-sm text-gray-200 whitespace-pre-wrap overflow-auto p-3'
        style={{
          height: `${height}px`,
          transition: isResizing ? 'none' : 'height 0.15s ease-out',
        }}
      >
        {content}
      </div>

      {/* Resize handle - Bottom edge */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-3
          cursor-ns-resize bg-transparent hover:bg-gray-600/20 
          transition-colors duration-150
          flex items-center justify-center
          group
          ${isResizing ? 'bg-gray-600/30' : ''}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Visual resize indicator */}
        <div
          className={`w-12 h-1 bg-gray-600/40 rounded-full group-hover:bg-gray-500/60 transition-colors duration-150 ${
            isResizing ? 'bg-gray-500/80' : ''
          }`}
        />
      </div>

      {/* Corner resize handle - Bottom right */}
      <div
        className={`
          absolute bottom-0 right-0 w-4 h-4
          cursor-nw-resize bg-transparent hover:bg-gray-600/20
          transition-colors duration-150
          group flex items-end justify-end
          ${isResizing ? 'bg-gray-600/30' : ''}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Medium-sized corner grip */}
        <div className='absolute bottom-0.5 right-0.5 space-y-0.5'>
          <div className='flex space-x-0.5 justify-end'>
            <div className='w-0.5 h-0.5 bg-gray-400/70 group-hover:bg-gray-300/90 rounded-sm transition-colors' />
            <div className='w-0.5 h-0.5 bg-gray-400/70 group-hover:bg-gray-300/90 rounded-sm transition-colors' />
            <div className='w-0.5 h-0.5 bg-gray-400/70 group-hover:bg-gray-300/90 rounded-sm transition-colors' />
          </div>
          <div className='flex space-x-0.5 justify-end'>
            <div className='w-0.5 h-0.5 bg-gray-400/70 group-hover:bg-gray-300/90 rounded-sm transition-colors' />
            <div className='w-0.5 h-0.5 bg-gray-400/70 group-hover:bg-gray-300/90 rounded-sm transition-colors' />
          </div>
          <div className='flex space-x-0.5 justify-end'>
            <div className='w-0.5 h-0.5 bg-gray-400/70 group-hover:bg-gray-300/90 rounded-sm transition-colors' />
          </div>
        </div>
      </div>

      {/* Size indicator tooltip */}
      {isResizing && (
        <div className='absolute bottom-6 right-4 bg-gray-800/90 text-gray-200 px-3 py-1.5 rounded-md text-xs font-mono border border-gray-600/50 shadow-lg'>
          {height}px / {maxHeight}px
        </div>
      )}
    </div>
  );
};

export default ResizableTerminal;
