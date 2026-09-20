import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid color');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const updateSettingsSchema = z
  .object({
    balance: z.coerce.number().finite().min(-1_000_000_000).max(1_000_000_000).optional(),
    monthlyBudget: z.coerce.number().finite().min(0).max(1_000_000_000).optional(),
  })
  .strict()
  .refine((v) => v.balance !== undefined || v.monthlyBudget !== undefined, {
    message: 'At least one field is required',
  });

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(40, 'Name must be 40 characters or fewer'),
    color: hexColor,
    excludeFromBudget: z.boolean().optional().default(false),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(40, 'Name must be 40 characters or fewer')
      .optional(),
    color: hexColor.optional(),
    excludeFromBudget: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const createTransactionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must be 120 characters or fewer'),
    amount: z.coerce.number().positive('Amount must be greater than 0').max(1_000_000_000),
    type: z.enum(['income', 'expense']),
    category: objectId,
    date: isoDate,
  })
  .strict();

export const updateTransactionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must be 120 characters or fewer')
      .optional(),
    amount: z.coerce
      .number()
      .positive('Amount must be greater than 0')
      .max(1_000_000_000)
      .optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: objectId.optional(),
    date: isoDate.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const getTransactionsQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM')
    .optional(),
  category: objectId.optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});
