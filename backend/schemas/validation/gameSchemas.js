import { z } from 'zod';

export const updateScoreSchema = z.object({
  score: z
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .nonnegative('Score must be a non-negative number')
    .max(1000, 'Score is too high'),
  difficulty: z.enum(['easy', 'normal', 'hard'], {
    errorMap: () => ({ message: 'Difficulty must be easy, normal, or hard' }),
  }),
});

export const updateAchievementsSchema = z.object({
  achievements: z
    .object({
      firstPlay: z.boolean().optional(),
      reach10PLevel: z.boolean().optional(),
      reach25PLevel: z.boolean().optional(),
      reach50PLevel: z.boolean().optional(),
    })
    .strict(),
});
