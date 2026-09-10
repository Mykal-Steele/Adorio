import { z } from 'zod';

export const updateScoreSchema = z.object({
  score: z
    .number({ error: 'Score must be a number' })
    .nonnegative('Score must be a non-negative number'),
  difficulty: z.enum(['easy', 'normal', 'hard'], {
    error: 'Difficulty must be easy, normal, or hard',
  }),
});
