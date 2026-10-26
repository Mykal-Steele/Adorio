import type { ReactNode } from 'react';
import { splitIntoColumns } from '../utils/postColumns';

// Two fixed columns from sm up, so a new page only adds to the bottom of each column.
// On phones the column wrappers turn into `contents` and each card is ordered by its
// feed index, so one column still reads newest first instead of every other post.
export default function PostColumns<T extends { _id: string }>({
  posts,
  renderPost,
}: {
  posts: T[];
  renderPost: (post: T, index: number) => ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-[clamp(24px,3vw,38px)] sm:grid-cols-2">
      {splitIntoColumns(posts).map((column, columnIndex) => (
        <div key={columnIndex} className="contents sm:block">
          {column.map(({ post, index }) => (
            <div key={post._id} style={{ order: index }}>
              {renderPost(post, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
