import { z } from 'zod';

export const MAX_HOSTED_FILE_BYTES = 100 * 1024 * 1024;

export const presignUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(200, 'Filename too long')
    .refine((name) => !/[\\/]/.test(name), 'Filename cannot contain a path'),
  contentType: z.string().min(1, 'Content type is required').max(150, 'Content type too long'),
  size: z.number().int().positive().max(MAX_HOSTED_FILE_BYTES, 'File must be under 100 MB'),
  turnstileToken: z.string().max(4096, 'Turnstile token too long').optional(),
});

export const confirmUploadSchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(80, 'Slug too long'),
});
