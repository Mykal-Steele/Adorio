import { z } from "zod";

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(160),
  mimeType: z.string().trim().min(1).max(120),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
  dataUrl: z.string().trim().startsWith("data:").max(15_000_000),
});

export const createPostSchema = z.object({
  content: z.string().trim().min(1).max(600),
  attachments: z.array(attachmentSchema).max(6).default([]),
});

export const createCommentSchema = z.object({
  postId: z.string().cuid(),
  text: z.string().trim().min(1).max(400),
  parentId: z.string().cuid().optional(),
  attachments: z.array(attachmentSchema).max(4).default([]),
});

export const votePostSchema = z.object({
  postId: z.string().cuid(),
  value: z.union([z.literal(-1), z.literal(1)]),
});

export const voteCommentSchema = z.object({
  commentId: z.string().cuid(),
  value: z.union([z.literal(-1), z.literal(1)]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type VotePostInput = z.infer<typeof votePostSchema>;
export type VoteCommentInput = z.infer<typeof voteCommentSchema>;
