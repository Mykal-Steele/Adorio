import { z } from 'zod';

export const createSecretSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  password: z.string().min(1, 'Password is required'),
});
