import { z } from 'zod';

export const updateScoreSchema = z.object({
  score: z
    .number({ invalid_type_error: 'Score must be a number' })
    .nonnegative('Score must be a non-negative number'),
  difficulty: z.enum(['easy', 'normal', 'hard'], {
    errorMap: () => ({ message: 'Difficulty must be easy, normal, or hard' }),
  }),
});
