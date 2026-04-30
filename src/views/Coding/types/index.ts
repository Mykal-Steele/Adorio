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
