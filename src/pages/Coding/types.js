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

/**
 * @typedef {Object} TestCase
 * @property {string} name - Test case identifier
 * @property {Array} args - Function arguments
 * @property {*} expected - Expected output
 */

/**
 * @typedef {Object} Problem
 * @property {string} id - Unique identifier
 * @property {string} title - Problem title
 * @property {string} difficulty - Problem difficulty level
 * @property {string} description - Problem description
 * @property {string} functionName - Name of function to implement
 * @property {string} starterCode - Initial code template
 * @property {Array<TestCase>} tests - Test cases
 * @property {Array<string>} [constraints] - Problem constraints
 * @property {Array<Object>} [examples] - Usage examples
 * @property {boolean} [isVisible=true] - Controls whether the problem appears in listings
 */

/**
 * @typedef {Object} TestResult
 * @property {string} status - Test execution status
 * @property {Array} tests - Individual test results
 * @property {string} [error] - Error message if failed
 */
