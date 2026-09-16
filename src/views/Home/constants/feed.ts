export const POSTS_PAGE_SIZE = 12;

// Thread levels 0, 1, 2 render indented; anything deeper is flattened onto its
// level-2 ancestor (same rule as the backend MAX_THREAD_DEPTH in
// backend/services/postService.js — keep the two in sync).
export const MAX_THREAD_DEPTH = 2;

// Indent per reply level in the thread view (no connector lines by design).
export const THREAD_INDENT_PX = 30;
