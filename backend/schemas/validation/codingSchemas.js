import { z } from 'zod';

const stdioTestCaseSchema = z
  .object({
    name: z.string().min(1),
    stdin: z.string(),
    expectedOutput: z.string(),
  })
  .strict();

export const codingRunSchema = z
  .object({
    problemId: z.string().min(1),
    language: z.enum(['java'], { error: () => 'Unsupported language' }),
    code: z.string().min(1, 'Code is required').max(20000, 'Code is too long'),
    tests: z.array(stdioTestCaseSchema).min(1).max(30),
  })
  .strict();
