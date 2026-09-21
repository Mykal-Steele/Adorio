export interface TestCase {
  name: string;
  args: unknown[];
  expected: unknown;
}

export interface StdioTestCase {
  name: string;
  stdin: string;
  expectedOutput: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export const Language = {
  JAVASCRIPT: 'javascript',
  JAVA: 'java',
  PYTHON: 'python',
} as const;

export interface CallLanguageVariant {
  kind: 'call';
  functionName: string;
  methodName?: string;
  starterCode: string;
  tests: TestCase[];
}

export interface StdioLanguageVariant {
  kind: 'stdio';
  starterCode: string;
  tests: StdioTestCase[];
}

export type LanguageVariant = CallLanguageVariant | StdioLanguageVariant;

export interface Problem {
  id: string;
  classId: string;
  title: string;
  difficulty: string;
  description: string;
  languages: Record<string, LanguageVariant>;
  constraints?: string[];
  examples?: ProblemExample[];
  isVisible?: boolean;
}

export interface ProblemClass {
  id: string;
  name: string;
  description?: string;
}
