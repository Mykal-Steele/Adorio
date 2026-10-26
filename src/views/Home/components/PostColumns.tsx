'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { splitIntoColumns } from '../utils/postColumns';

const TWO_COLUMNS = '(min-width: 640px)';

// Phones get one list in feed order. From sm up it's two fixed columns, so a new page only
// adds to the bottom of each column and nothing on screen moves. The two need a different
// DOM order (screen readers and Tab follow the DOM), so they are two lists. The server
// can't know the width, so it sends both and CSS shows the right one; after mount only
// the one in use renders.
export default function PostColumns<T extends { _id: string }>({
  posts,
  renderPost,
}: {
  posts: T[];
  renderPost: (post: T, index: number) => ReactNode;
}) {
  const [twoColumns, setTwoColumns] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(TWO_COLUMNS);
    const update = () => setTwoColumns(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <>
      <div className="sm:hidden">
        {twoColumns !== true &&
          posts.map((post, index) => <div key={post._id}>{renderPost(post, index)}</div>)}
      </div>
      <div className="hidden grid-cols-2 gap-x-[clamp(24px,3vw,38px)] sm:grid">
        {twoColumns !== false &&
          splitIntoColumns(posts).map((column, columnIndex) => (
            <div key={columnIndex}>
              {column.map(({ post, index }) => (
                <div key={post._id}>{renderPost(post, index)}</div>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}
