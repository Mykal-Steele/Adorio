import { z } from 'zod';

export const pageViewsQuerySchema = z.object({
  start: z.string().max(100).optional(),
  end: z.string().max(100).optional(),
  path: z.string().max(500).optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  timezone: z.string().max(50).optional(),
});

export const recentVisitsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(500).optional(),
  visitorId: z.string().max(64).optional(),
});

export const visitorStatsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(500).optional(),
  deduplicate: z.enum(['true', 'false']).optional(),
});
