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
    language: z.enum(['java', 'python'], { error: () => 'Unsupported language' }),
    code: z.string().min(1, 'Code is required').max(20000, 'Code is too long'),
    tests: z.array(stdioTestCaseSchema).min(1).max(30),
  })
  .strict();

// a hold maxes out at 4 hours. The VM's own idle backstop (idleBackstopSeconds
// in infra/piston.bicep) is set higher than this.
export const codeRunnerHoldSchema = z
  .object({
    minutes: z
      .number({ error: () => 'minutes must be a number' })
      .int('minutes must be a whole number')
      .min(15, 'A hold must be at least 15 minutes')
      .max(240, 'A hold can be at most 4 hours'),
  })
  .strict();
