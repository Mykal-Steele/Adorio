import { z } from 'zod';

const secretName = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9][a-z0-9-]{2,39}$/,
    'Project name must be 3-40 lowercase letters, digits, or dashes',
  );

export const createSecretSchema = z
  .object({
    name: secretName.optional(),
    message: z
      .string()
      .min(1, 'Message is required')
      .max(256 * 1024, 'Message is too large'),
    password: z.string().min(1, 'Password is required').max(1024, 'Password is too long'),
  })
  .superRefine((data, ctx) => {
    if (data.name && data.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passphrase must be at least 8 characters',
        path: ['password'],
      });
    }
    if (data.name && !/^[\x20-\x7e]*[\x21-\x7e]$/.test(data.password)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passphrase must use printable ASCII and must not end with whitespace',
        path: ['password'],
      });
    }
  });

export const secretNameSchema = z.object({ name: secretName });
