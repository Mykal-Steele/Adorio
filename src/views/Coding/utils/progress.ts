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

// localStorage can throw in private browsing / when a quota is hit — these are
// environment limits, not bugs, so a write just silently doesn't persist.
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

// Called on every keystroke (debounced) — keeps the draft without touching
// whatever the last real test run recorded, so a problem marked solved stays
// solved while you keep tinkering with already-passing code.
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

// Called once a run finishes — code and results are saved together since they
// describe the same snapshot of the solution.
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
