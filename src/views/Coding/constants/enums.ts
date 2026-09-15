export const TestStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILURE: 'failure',
  ERROR: 'error',
};

export const ProblemDifficulty = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const DIFFICULTY_CHIP_CLASS: Record<string, string> = {
  [ProblemDifficulty.EASY]: 'bg-[#e7efd5] text-[var(--paper-ink)]',
  [ProblemDifficulty.MEDIUM]: 'bg-[var(--paper-yellow-soft)] text-[var(--paper-ink)]',
  [ProblemDifficulty.HARD]: 'bg-[#f3ded9] text-[var(--paper-ink)]',
};
