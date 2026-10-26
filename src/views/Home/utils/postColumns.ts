// Two fixed columns instead of a CSS multi-column layout: a native `column-width`
// rebalances its entire contents from scratch whenever the total content changes,
// which visibly moves already-rendered posts into a different column every time
// a new page loads. Assigning each post to a column by its own stable index means
// a newly loaded post only ever appends to the end of a column, it never moves
// one that's already on screen.
export function splitIntoColumns<T>(posts: T[]) {
  const columns: { post: T; index: number }[][] = [[], []];
  posts.forEach((post, index) => {
    columns[index % 2].push({ post, index });
  });
  return columns;
}
