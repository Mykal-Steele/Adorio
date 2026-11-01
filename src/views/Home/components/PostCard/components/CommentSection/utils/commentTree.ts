import { MAX_THREAD_DEPTH } from '../../../../../constants/feed';

type ThreadComment = {
  _id: string;
  text: string;
  user?: { _id?: string; username?: string; isAdmin?: boolean } | null;
  createdAt: string;
  parentId?: string | null;
  depth?: number;
};

export interface ThreadNode {
  comment: ThreadComment;
  // How far to indent, from the shape of the tree. Never more than MAX_THREAD_DEPTH.
  depth: number;
  children: ThreadNode[];
}

const byAge = (a: ThreadNode, b: ThreadNode) =>
  new Date(a.comment.createdAt || 0).getTime() - new Date(b.comment.createdAt || 0).getTime();

// Resolves where an optimistic reply should attach, mirroring the server's
// flatten rule so the UI never shows a depth the backend would collapse.
export const getEffectiveParent = (
  comments: ThreadComment[],
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

// The server stores a reply to a level-2 comment with that comment as its parent, so a
// long exchange becomes a chain that keeps growing. Showing it as stored would indent
// every reply further. Instead, a reply deeper than the limit is shown as a sibling at
// the last level, under the same comment as the level-2 comment it answers.
export const buildCommentTree = (comments: ThreadComment[]): ThreadNode[] => {
  if (!Array.isArray(comments)) return [];
  const byId = new Map<string, ThreadComment>();
  comments.forEach((comment) => {
    if (comment?._id) byId.set(comment._id.toString(), comment);
  });

  const parentOf = (id: string) => {
    const parentId = byId.get(id)?.parentId?.toString();
    return parentId && parentId !== id ? parentId : undefined;
  };

  // Comments that point at each other have no top, so the walk stops at one it has seen.
  const levels = new Map<string, number>();
  const levelOf = (id: string, trail: Set<string>): number => {
    const known = levels.get(id);
    if (known !== undefined) return known;
    const parentId = parentOf(id);
    const hasParent = parentId !== undefined && byId.has(parentId) && !trail.has(parentId);
    const level = hasParent ? levelOf(parentId, new Set(trail).add(id)) + 1 : 0;
    levels.set(id, level);
    return level;
  };
  byId.forEach((_, id) => levelOf(id, new Set()));

  const nodes = new Map<string, ThreadNode>();
  byId.forEach((comment, id) => {
    nodes.set(id, {
      comment,
      depth: Math.min(levels.get(id) ?? 0, MAX_THREAD_DEPTH),
      children: [],
    });
  });

  const roots: ThreadNode[] = [];
  nodes.forEach((node, id) => {
    if ((levels.get(id) ?? 0) === 0) {
      roots.push(node);
      return;
    }
    let parentId = parentOf(id);
    while (parentId !== undefined && (levels.get(parentId) ?? 0) >= MAX_THREAD_DEPTH) {
      parentId = parentOf(parentId);
    }
    const parent = parentId === undefined ? undefined : nodes.get(parentId);
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const sortBranch = (branch: ThreadNode[]) => {
    branch.sort(byAge);
    branch.forEach((node) => sortBranch(node.children));
  };
  sortBranch(roots);
  return roots;
};
