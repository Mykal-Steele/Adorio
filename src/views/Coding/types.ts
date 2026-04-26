// Core data types and interfaces for the coding challenge system

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

export interface TestCase {
  name: string;
  args: unknown[];
  expected: unknown;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  functionName: string;
  starterCode: string;
  tests: TestCase[];
  constraints?: string[];
  examples?: ProblemExample[];
  isVisible?: boolean;
}
