import { z } from 'zod';

export const uploadFileSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(100, 'Filename too long')
    .regex(/^[\w\-. ]+\.html$/i, 'File must be a .html file'),
  content: z
    .string()
    .min(1, 'File content cannot be empty')
    .max(512 * 1024, 'File must be under 512 KB'),
});
