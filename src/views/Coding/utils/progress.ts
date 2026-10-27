import { debounce } from 'lodash';
import type { ExecuteResult } from '../CodeRunner';
import type { Problem } from '../types';
import { STORAGE_KEY_PREFIX, ACTIVE_PROBLEM_KEY_PREFIX } from '../constants/storage';

interface SavedProgress {
  code: string;
  results: ExecuteResult | null;
  lastModified: number;
}

const keyFor = (problemId: string, language: string) =>
  `${STORAGE_KEY_PREFIX}${problemId}:${language}`;
const activeProblemKeyFor = (classId: string) => `${ACTIVE_PROBLEM_KEY_PREFIX}${classId}`;

// localStorage throws in private browsing or when full, just skip the save
const write = (problemId: string, language: string, data: SavedProgress) => {
  try {
    localStorage.setItem(keyFor(problemId, language), JSON.stringify(data));
  } catch {
    /* see comment above */
  }
};

export const loadProgress = (problemId: string, language: string): SavedProgress | null => {
  if (!problemId) return null;
  try {
    const raw = localStorage.getItem(keyFor(problemId, language));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// keeps the last run's results, so a solved problem stays solved while you tinker
export const saveCode = (problemId: string, language: string, code: string) => {
  if (!problemId) return;
  const existing = loadProgress(problemId, language);
  write(problemId, language, {
    code,
    results: existing?.results ?? null,
    lastModified: Date.now(),
  });
};

export const saveCodeDebounced = debounce(saveCode, 800);

export const saveRunResult = (
  problemId: string,
  language: string,
  code: string,
  results: ExecuteResult,
) => {
  if (!problemId) return;
  write(problemId, language, { code, results, lastModified: Date.now() });
};

export const clearProgress = (problemId: string, language: string) => {
  if (!problemId) return;
  try {
    localStorage.removeItem(keyFor(problemId, language));
  } catch {
    /* see comment above */
  }
};

export const isSolved = (problemId: string, language: string) =>
  loadProgress(problemId, language)?.results?.status === 'success';

export const isProblemSolved = (problem: Problem) =>
  Object.keys(problem.languages).some((language) => isSolved(problem.id, language));

export const getLastActiveProblem = (classId: string) => {
  try {
    return localStorage.getItem(activeProblemKeyFor(classId));
  } catch {
    return null;
  }
};

export const setLastActiveProblem = (classId: string, problemId: string) => {
  try {
    localStorage.setItem(activeProblemKeyFor(classId), problemId);
  } catch {
    /* see comment above */
  }
};
