import { splitIntoColumns } from '../../src/views/Home/utils/postColumns.ts';

const posts = (n) => Array.from({ length: n }, (_, i) => ({ _id: `p${i}` }));
const ids = (columns) => columns.map((column) => column.map(({ post }) => post._id));

describe('splitIntoColumns', () => {
  test('should alternate posts between two columns, newest first in each', () => {
    expect(ids(splitIntoColumns(posts(5)))).toEqual([
      ['p0', 'p2', 'p4'],
      ['p1', 'p3'],
    ]);
  });

  test('should keep each post at its feed index for the card', () => {
    const [left, right] = splitIntoColumns(posts(3));
    expect(left.map(({ index }) => index)).toEqual([0, 2]);
    expect(right.map(({ index }) => index)).toEqual([1]);
  });

  // The reason it exists: a new page only adds to the bottom of each column,
  // nothing already on screen moves.
  test('should never move a loaded post when the next page arrives', () => {
    const before = ids(splitIntoColumns(posts(6)));
    const after = ids(splitIntoColumns(posts(11)));
    before.forEach((column, c) => {
      expect(after[c].slice(0, column.length)).toEqual(column);
    });
  });

  test('should give two empty columns for no posts', () => {
    expect(splitIntoColumns([])).toEqual([[], []]);
  });
});
