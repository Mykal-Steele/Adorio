import { MAX_THREAD_DEPTH } from '../../../../../constants/feed';

export interface ThreadNode {
  comment: {
    _id: string;
    text: string;
    user?: { _id?: string; username?: string; isAdmin?: boolean } | null;
    createdAt: string;
    parentId?: string | null;
    depth?: number;
  };
  children: ThreadNode[];
}

const byAge = (a: ThreadNode, b: ThreadNode) =>
  new Date(a.comment.createdAt || 0).getTime() - new Date(b.comment.createdAt || 0).getTime();

export const getVisualDepth = (depth?: number) =>
  Math.min(Math.max(depth ?? 0, 0), MAX_THREAD_DEPTH);

// Resolves where an optimistic reply should attach, mirroring the server's
// flatten rule so the UI never shows a depth the backend would collapse.
export const getEffectiveParent = (
  comments: ThreadNode['comment'][],
  parentId: string,
): { parentId: string; depth: number } => {
  const byId = new Map(comments.map((c) => [c._id?.toString(), c]));
  const parent = byId.get(parentId);
  const parentDepth = parent?.depth ?? 0;
  if (parentDepth + 1 > MAX_THREAD_DEPTH) {
    return { parentId, depth: MAX_THREAD_DEPTH };
  }
  return { parentId, depth: parentDepth + 1 };
};

export const buildCommentTree = (comments: ThreadNode['comment'][]): ThreadNode[] => {
  if (!Array.isArray(comments)) return [];
  const nodes = new Map<string, ThreadNode>();
  const roots: ThreadNode[] = [];

  comments.forEach((comment) => {
    if (comment?._id) nodes.set(comment._id.toString(), { comment, children: [] });
  });

  nodes.forEach((node) => {
    const rawParentId = node.comment.parentId?.toString();
    const parent = rawParentId ? nodes.get(rawParentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortBranch = (branch: ThreadNode[]) => {
    branch.sort(byAge);
    branch.forEach((node) => sortBranch(node.children));
  };
  sortBranch(roots);
  return roots;
};
