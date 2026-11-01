import { buildCommentTree } from '../../src/views/Home/components/PostCard/components/CommentSection/utils/commentTree.ts';

// minute N after a fixed start, so the order is easy to read
const at = (minute) => new Date(Date.UTC(2026, 10, 1, 9, minute)).toISOString();
const comment = (id, parentId, minute, extra = {}) => ({
  _id: id,
  text: `comment ${id}`,
  parentId,
  createdAt: at(minute),
  ...extra,
});

// the shape of a tree as plain data: [id, depth, [children...]]
const shape = (nodes) => nodes.map((n) => [n.comment._id, n.depth, shape(n.children)]);

describe('buildCommentTree', () => {
  test('should nest replies up to level 2', () => {
    const tree = buildCommentTree([
      comment('a', null, 1),
      comment('b', 'a', 2),
      comment('c', 'b', 3),
    ]);
    expect(shape(tree)).toEqual([['a', 0, [['b', 1, [['c', 2, []]]]]]]);
  });

  test('should flatten every reply deeper than level 2 into siblings at level 2', () => {
    // The server stores each reply to a level-2 comment with that comment as its parent,
    // so the stored chain keeps growing: a > b > c > d > e > f.
    const tree = buildCommentTree([
      comment('a', null, 1, { depth: 0 }),
      comment('b', 'a', 2, { depth: 1 }),
      comment('c', 'b', 3, { depth: 2 }),
      comment('d', 'c', 4, { depth: 2 }),
      comment('e', 'd', 5, { depth: 2 }),
      comment('f', 'e', 6, { depth: 2 }),
    ]);
    expect(shape(tree)).toEqual([
      [
        'a',
        0,
        [
          [
            'b',
            1,
            [
              ['c', 2, []],
              ['d', 2, []],
              ['e', 2, []],
              ['f', 2, []],
            ],
          ],
        ],
      ],
    ]);
  });

  test('should never show a comment deeper than level 2', () => {
    const chain = Array.from({ length: 12 }, (_, i) =>
      comment(`c${i}`, i === 0 ? null : `c${i - 1}`, i),
    );
    const deepest = (nodes) =>
      Math.max(...nodes.map((n) => Math.max(n.depth, deepest(n.children))), 0);
    expect(deepest(buildCommentTree(chain))).toBe(2);
  });

  test('should work out the level from the tree, not from a stored depth field', () => {
    const tree = buildCommentTree([comment('a', null, 1), comment('b', 'a', 2)]);
    expect(shape(tree)).toEqual([['a', 0, [['b', 1, []]]]]);
  });

  test('should order each branch oldest first, including flattened replies', () => {
    const tree = buildCommentTree([
      comment('a', null, 1),
      comment('b', 'a', 2),
      comment('x', 'b', 3), // level 2
      comment('z', 'b', 5), // level 2, written after the reply below
      comment('y', 'x', 4), // reply to x, flattened next to it
    ]);
    const level1 = tree[0].children[0];
    expect(level1.children.map((n) => n.comment._id)).toEqual(['x', 'y', 'z']);
  });

  test('should order top level comments oldest first', () => {
    const tree = buildCommentTree([comment('late', null, 9), comment('early', null, 1)]);
    expect(tree.map((n) => n.comment._id)).toEqual(['early', 'late']);
  });

  test('should show a reply whose parent is missing as a top level comment', () => {
    const tree = buildCommentTree([comment('orphan', 'gone', 1)]);
    expect(shape(tree)).toEqual([['orphan', 0, []]]);
  });

  test('should not loop forever on comments that point at each other', () => {
    const tree = buildCommentTree([
      comment('a', 'b', 1),
      comment('b', 'a', 2),
      comment('c', 'c', 3),
    ]);
    const ids = [];
    const walk = (nodes) => nodes.forEach((n) => (ids.push(n.comment._id), walk(n.children)));
    walk(tree);
    expect(ids.sort()).toEqual(['a', 'b', 'c']);
  });

  test('should return an empty list for anything that is not a list', () => {
    expect(buildCommentTree(undefined)).toEqual([]);
    expect(buildCommentTree(null)).toEqual([]);
  });
});
