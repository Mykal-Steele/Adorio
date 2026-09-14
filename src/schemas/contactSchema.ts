import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(254),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
  // Honeypot — hidden from real visitors via CSS, so only bots that blindly
  // fill every input end up populating it. Never surfaced as a validation error.
  website: z.string().max(200).optional(),
});
