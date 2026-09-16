import type { ProblemClass } from '../types';

export const ProblemClassId = {
  ALGORITHMS: 'algorithms',
  JAVA_FUNDAMENTALS: 'java-fundamentals',
} as const;

export const CLASSES: ProblemClass[] = [
  {
    id: ProblemClassId.ALGORITHMS,
    name: 'Algorithms',
    description: 'Classic algorithm and data-structure katas.',
  },
  {
    id: ProblemClassId.JAVA_FUNDAMENTALS,
    name: 'Java Fundamentals',
    description: 'Stdin/stdout practice problems, graded like a real auto-grader.',
  },
];

export const getClasses = () => CLASSES;

export const getClass = (id: string) => CLASSES.find((c) => c.id === id) ?? null;
