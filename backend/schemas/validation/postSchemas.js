import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be 50,000 characters or fewer'),
});

export const addCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment text is required')
    .max(5000, 'Comment must be 5,000 characters or fewer'),
  parentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent comment id')
    .optional(),
  mentions: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid mentioned user id'))
    .max(10, 'Too many mentions')
    .optional()
    .default([]),
});

export const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(5),
  hasImage: z.coerce.boolean().optional(),
});
