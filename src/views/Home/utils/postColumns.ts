// Two fixed columns instead of CSS columns: `column-width` rebalances everything when
// the content changes, so every new page moves posts that are already on screen.
// Picking the column from each post's index means new posts only append to the end.
export function splitIntoColumns<T>(posts: T[]) {
  const columns: { post: T; index: number }[][] = [[], []];
  posts.forEach((post, index) => {
    columns[index % 2].push({ post, index });
  });
  return columns;
}
