/**
 * Problem Storage Utility
 * Handles persistent storage for coding problems with proper formatting preservation
 */

const STORAGE_KEY_PREFIX = 'coding_problem_';
const ACTIVE_PROBLEM_KEY = 'coding_active_problem';
const STORAGE_VERSION = '1.0';

/**
 * Storage structure for each problem:
 * {
 *   version: string,
 *   problemId: string,
 *   code: string,
 *   results: object|null,
 *   lastModified: timestamp
 * }
 */

export class ProblemStorage {
  /**
   * Save problem state to localStorage
   * @param {string} problemId - Problem identifier
   * @param {Object} state - Problem state to save
   * @param {string} state.code - User's code
   * @param {Object|null} state.results - Test results
   */
  static saveProblemState(problemId, state) {
    if (!problemId || !state) return;

    try {
      const storageData = {
        version: STORAGE_VERSION,
        problemId,
        code: state.code || '',
        results: state.results || null,
        lastModified: Date.now(),
      };

      const key = `${STORAGE_KEY_PREFIX}${problemId}`;
      localStorage.setItem(key, JSON.stringify(storageData));

      // Also save as the last active problem
      this.saveActiveProblem(problemId);
    } catch (error) {
      console.warn('Failed to save problem state:', error);
    }
  }

  /**
   * Load problem state from localStorage
   * @param {string} problemId - Problem identifier
   * @returns {Object|null} Saved state or null if not found
   */
  static loadProblemState(problemId) {
    if (!problemId) return null;

    try {
      const key = `${STORAGE_KEY_PREFIX}${problemId}`;
      const stored = localStorage.getItem(key);

      if (!stored) return null;

      const data = JSON.parse(stored);

      // Validate data structure
      if (data.version !== STORAGE_VERSION || data.problemId !== problemId) {
        // Remove outdated data
        localStorage.removeItem(key);
        return null;
      }

      return {
        code: data.code || '',
        results: data.results || null,
        lastModified: data.lastModified || 0,
      };
    } catch (error) {
      console.warn('Failed to load problem state:', error);
      return null;
    }
  }

  /**
   * Save the currently active problem ID
   * @param {string} problemId - Problem identifier
   */
  static saveActiveProblem(problemId) {
    if (!problemId) return;

    try {
      localStorage.setItem(ACTIVE_PROBLEM_KEY, problemId);
    } catch (error) {
      console.warn('Failed to save active problem:', error);
    }
  }

  /**
   * Load the last active problem ID
   * @returns {string|null} Last active problem ID or null
   */
  static loadActiveProblem() {
    try {
      return localStorage.getItem(ACTIVE_PROBLEM_KEY);
    } catch (error) {
      console.warn('Failed to load active problem:', error);
      return null;
    }
  }

  /**
   * Check if a problem has saved state
   * @param {string} problemId - Problem identifier
   * @returns {boolean} True if problem has saved state
   */
  static hasSavedState(problemId) {
    if (!problemId) return false;

    try {
      const key = `${STORAGE_KEY_PREFIX}${problemId}`;
      const stored = localStorage.getItem(key);
      return stored !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all saved problem IDs
   * @returns {string[]} Array of problem IDs with saved state
   */
  static getSavedProblems() {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter((key) => key.startsWith(STORAGE_KEY_PREFIX))
        .map((key) => key.replace(STORAGE_KEY_PREFIX, ''))
        .filter(Boolean);
    } catch (error) {
      console.warn('Failed to get saved problems:', error);
      return [];
    }
  }

  /**
   * Clear saved state for a specific problem
   * @param {string} problemId - Problem identifier
   */
  static clearProblemState(problemId) {
    if (!problemId) return;

    try {
      const key = `${STORAGE_KEY_PREFIX}${problemId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear problem state:', error);
    }
  }

  /**
   * Clear all saved problem states
   */
  static clearAllProblems() {
    try {
      const keys = Object.keys(localStorage);
      keys
        .filter(
          (key) =>
            key.startsWith(STORAGE_KEY_PREFIX) || key === ACTIVE_PROBLEM_KEY
        )
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all problems:', error);
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage usage information
   */
  static getStorageInfo() {
    try {
      const savedProblems = this.getSavedProblems();
      const totalSize = savedProblems.reduce((size, problemId) => {
        const key = `${STORAGE_KEY_PREFIX}${problemId}`;
        const data = localStorage.getItem(key);
        return size + (data ? data.length : 0);
      }, 0);

      return {
        problemCount: savedProblems.length,
        totalSize: totalSize,
        sizeInKB: (totalSize / 1024).toFixed(2),
      };
    } catch (error) {
      console.warn('Failed to get storage info:', error);
      return { problemCount: 0, totalSize: 0, sizeInKB: '0.00' };
    }
  }

  /**
   * Debounced save function to prevent excessive localStorage writes
   * @param {string} problemId - Problem identifier
   * @param {Object} state - Problem state to save
   * @param {number} delay - Debounce delay in milliseconds (default: 1000)
   */
  static debouncedSave = (() => {
    let timeout;
    return (problemId, state, delay = 1000) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveProblemState(problemId, state);
      }, delay);
    };
  })();
}
