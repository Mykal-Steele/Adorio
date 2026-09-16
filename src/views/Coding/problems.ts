import type { Problem } from './types';
import { ProblemDifficulty } from './constants/enums';
import { ProblemClassId } from './constants/classes';

const isProblemVisible = (problem) => problem?.isVisible !== false;

export const problems: Problem[] = [
  {
    id: 'odd-numbers',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Generate Odd Numbers',
    difficulty: ProblemDifficulty.EASY,
    description:
      'Return an array containing all odd numbers from 1 to n (inclusive). Return empty array if n < 1.',
    constraints: [
      'n is an integer',
      'n can be negative, zero, or positive',
      'Return new array, do not modify inputs',
    ],
    examples: [
      {
        input: 'printOddNumbers(10)',
        output: '[1, 3, 5, 7, 9]',
      },
      {
        input: 'printOddNumbers(5)',
        output: '[1, 3, 5]',
      },
      {
        input: 'printOddNumbers(0)',
        output: '[]',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'printOddNumbers',
        starterCode: `/**
 * @param {number} n - The upper limit (inclusive)
 * @returns {number[]} Array of odd numbers from 1 to n
 */
function printOddNumbers(n) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic range',
            args: [10],
            expected: [1, 3, 5, 7, 9],
          },
          {
            name: 'small range',
            args: [5],
            expected: [1, 3, 5],
          },
          {
            name: 'zero',
            args: [0],
            expected: [],
          },
          {
            name: 'negative',
            args: [-5],
            expected: [],
          },
          {
            name: 'single odd',
            args: [1],
            expected: [1],
          },
          {
            name: 'single even',
            args: [2],
            expected: [1],
          },
          {
            name: 'large range',
            args: [20],
            expected: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
          },
        ],
      },
    },
  },
  {
    id: 'reverse-string',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Reverse String',
    difficulty: ProblemDifficulty.EASY,
    description: 'Return the input string with characters in reverse order.',
    constraints: [
      'Input is always a string',
      'Return new string, do not modify input',
      'Handle empty strings',
    ],
    examples: [
      {
        input: 'reverseString("hello")',
        output: '"olleh"',
      },
      {
        input: 'reverseString("")',
        output: '""',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'reverseString',
        starterCode: `/**
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 */
function reverseString(str) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic',
            args: ['hello'],
            expected: 'olleh',
          },
          {
            name: 'empty',
            args: [''],
            expected: '',
          },
          {
            name: 'single',
            args: ['a'],
            expected: 'a',
          },
          {
            name: 'palindrome',
            args: ['racecar'],
            expected: 'racecar',
          },
          {
            name: 'spaces',
            args: ['hello world'],
            expected: 'dlrow olleh',
          },
          {
            name: 'numbers',
            args: ['12345'],
            expected: '54321',
          },
          {
            name: 'special chars',
            args: ['a!b@c#'],
            expected: '#c@b!a',
          },
        ],
      },
    },
  },
  {
    id: 'prime-generator-brute',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Generate Primes (Brute Force)',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Return array of all prime numbers from 2 to n (inclusive). Use brute force method.',
    constraints: [
      'n is a non-negative integer',
      'n <= 1000',
      'Must use brute force algorithm',
      'Return new array',
    ],
    examples: [
      {
        input: 'generatePrimes(10)',
        output: '[2, 3, 5, 7]',
      },
      {
        input: 'generatePrimes(2)',
        output: '[2]',
      },
      {
        input: 'generatePrimes(1)',
        output: '[]',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'generatePrimes',
        starterCode: `/**
 * @param {number} n - The upper limit (inclusive)
 * @returns {number[]} Array of prime numbers from 2 to n using brute force
 */
function generatePrimes(n) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic',
            args: [10],
            expected: [2, 3, 5, 7],
          },
          {
            name: 'edge_single',
            args: [2],
            expected: [2],
          },
          {
            name: 'edge_empty',
            args: [1],
            expected: [],
          },
          {
            name: 'zero',
            args: [0],
            expected: [],
          },
          {
            name: 'small_prime',
            args: [3],
            expected: [2, 3],
          },
          {
            name: 'medium',
            args: [20],
            expected: [2, 3, 5, 7, 11, 13, 17, 19],
          },
          {
            name: 'larger',
            args: [30],
            expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
          },
        ],
      },
    },
  },
  {
    id: 'prime-sieve',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Prime Generator (Sieve of Eratosthenes)',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Generate all prime numbers between 2 and n (inclusive) using the **Sieve of Eratosthenes algorithm**. Return an empty array if n < 2.',
    constraints: [
      '0 <= n <= 100000',
      'Must use Sieve of Eratosthenes algorithm',
      'Return a new array',
      'Time complexity should be O(n log log n)',
    ],
    examples: [
      {
        input: 'sieveOfEratosthenes(10)',
        output: '[2, 3, 5, 7]',
        explanation: 'All prime numbers from 2 up to 10 using sieve algorithm.',
      },
      {
        input: 'sieveOfEratosthenes(20)',
        output: '[2, 3, 5, 7, 11, 13, 17, 19]',
        explanation: 'Sieve efficiently finds all primes up to 20.',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'sieveOfEratosthenes',
        starterCode: `/**
 * @param {number} n - The upper limit (inclusive)
 * @returns {number[]} Array of prime numbers from 2 to n using Sieve of Eratosthenes
 */
function sieveOfEratosthenes(n) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic',
            args: [10],
            expected: [2, 3, 5, 7],
          },
          {
            name: 'single',
            args: [2],
            expected: [2],
          },
          {
            name: 'empty',
            args: [1],
            expected: [],
          },
          {
            name: 'zero',
            args: [0],
            expected: [],
          },
          {
            name: 'small',
            args: [5],
            expected: [2, 3, 5],
          },
          {
            name: 'medium',
            args: [15],
            expected: [2, 3, 5, 7, 11, 13],
          },
          {
            name: 'larger',
            args: [20],
            expected: [2, 3, 5, 7, 11, 13, 17, 19],
          },
          {
            name: 'large',
            args: [50],
            expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
          },
        ],
      },
    },
  },
  {
    id: 'tower-of-hanoi',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Tower of Hanoi Solver',
    difficulty: ProblemDifficulty.HARD,
    description:
      'Implement Tower of Hanoi class. Constructor takes number of disks. Method play() solves puzzle and returns total move count.',
    constraints: [
      'numberOfDisks is positive integer',
      '1 <= numberOfDisks <= 10',
      'Move all disks from peg A to peg C',
      'Larger disk never on smaller disk',
      'Return move count as integer',
    ],
    examples: [
      {
        input: 'new TowerOfHanoi(3).play()',
        output: '7',
      },
      {
        input: 'new TowerOfHanoi(2).play()',
        output: '3',
      },
      {
        input: 'new TowerOfHanoi(1).play()',
        output: '1',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'TowerOfHanoi',
        methodName: 'play',
        starterCode: `/**
 * Tower of Hanoi 
 * @param {number} numberOfDisks - Number of disks to solve for
 */
class TowerOfHanoi {
  constructor(disk) {
   
  }

  /**
   * IMPORTANT
   * @return {number} ithMove - number of moves it took to solve
   * IMPORTANT
   */
  play() {
    // Your solution here
  }
  
  // Call the following method in your code for visual
  // Name your pegs as - pegA, pegB, pegC, and have a variable called ithMove
  showTowerOfHanoi() {
    // Find the maximum height among all three pegs
    const maxHeight = Math.max(this.pegA.length, this.pegB.length, this.pegC.length);
    
    console.log('Move ' + this.ithMove);
    
    // Display each level from top to bottom
    for (let level = maxHeight - 1; level >= 0; level--) {
      let line = '';
      
      // Peg A
      if (this.pegA.length > level) {
        line += this.pegA[level];
      } else {
        line += '.';
      }
      line += '   ';
      
      // Peg B
      if (this.pegB.length > level) {
        line += this.pegB[level];
      } else {
        line += '.';
      }
      line += '   ';
      
      // Peg C
      if (this.pegC.length > level) {
        line += this.pegC[level];
      } else {
        line += '.';
      }
      
      console.log(line);
    }
    
    // Peg labels
    console.log('A   B   C');
    console.log('-----------');
  }
}
`,
        tests: [
          {
            name: 'one_disk',
            args: [1],
            expected: 1,
          },
          {
            name: 'two_disks',
            args: [2],
            expected: 3,
          },
          {
            name: 'three_disks',
            args: [3],
            expected: 7,
          },
          {
            name: 'four_disks',
            args: [4],
            expected: 15,
          },
          {
            name: 'five_disks',
            args: [5],
            expected: 31,
          },
        ],
      },
    },
  },
  {
    id: 'matrix-multiplication',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Matrix Multiplication',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Multiply two matrices A and B. Return the resulting matrix C where C[i][j] = sum of A[i][k] * B[k][j].',
    constraints: [
      'A is m×n matrix, B is n×p matrix',
      'A columns equals B rows',
      'All elements are integers',
      'Return new matrix, do not modify inputs',
    ],
    examples: [
      {
        input: 'multiplyMatrices([[1, 2], [3, 4]], [[5, 6], [7, 8]])',
        output: '[[19, 22], [43, 50]]',
      },
      {
        input: 'multiplyMatrices([[1, 2, 3]], [[4], [5], [6]])',
        output: '[[32]]',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'multiplyMatrices',
        starterCode: `/**
 * @param {number[][]} A - First matrix (m × n)
 * @param {number[][]} B - Second matrix (n × p)
 * @returns {number[][]} Result matrix C (m × p)
 */
function multiplyMatrices(A, B) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic_2x2',
            args: [
              [
                [1, 2],
                [3, 4],
              ],
              [
                [5, 6],
                [7, 8],
              ],
            ],
            expected: [
              [19, 22],
              [43, 50],
            ],
          },
          {
            name: 'vector_multiply',
            args: [[[1, 2, 3]], [[4], [5], [6]]],
            expected: [[32]],
          },
          {
            name: 'rectangular',
            args: [
              [
                [1, 2],
                [3, 4],
                [5, 6],
              ],
              [
                [10, 20, 30, 40],
                [50, 60, 70, 80],
              ],
            ],
            expected: [
              [110, 140, 170, 200],
              [230, 300, 370, 440],
              [350, 460, 570, 680],
            ],
          },
          {
            name: 'identity',
            args: [
              [
                [1, 0],
                [0, 1],
              ],
              [
                [5, 6],
                [7, 8],
              ],
            ],
            expected: [
              [5, 6],
              [7, 8],
            ],
          },
          {
            name: 'single_element',
            args: [[[3]], [[7]]],
            expected: [[21]],
          },
          {
            name: 'zero_matrix',
            args: [
              [
                [0, 0],
                [0, 0],
              ],
              [
                [1, 2],
                [3, 4],
              ],
            ],
            expected: [
              [0, 0],
              [0, 0],
            ],
          },
          {
            name: 'different_dimensions',
            args: [[[1, 2, 3, 4]], [[1], [1], [1], [1]]],
            expected: [[10]],
          },
        ],
      },
    },
  },
  {
    id: 'greatest-common-divisor',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Greatest Common Divisor',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Write a function `findGCD(a, b)` that returns the greatest common divisor (GCD) of two positive integers. The GCD is the largest positive integer that divides both numbers without a remainder.',
    constraints: [
      '1 <= a, b <= 10000',
      'Both inputs will always be positive integers',
      'Return the GCD as a positive integer',
    ],
    examples: [
      {
        input: 'findGCD(20, 15)',
        output: '5',
        explanation: 'The largest number that divides both 20 and 15 is 5.',
      },
      {
        input: 'findGCD(48, 18)',
        output: '6',
        explanation: 'The largest number that divides both 48 and 18 is 6.',
      },
      {
        input: 'findGCD(17, 13)',
        output: '1',
        explanation: 'Since 17 and 13 are both prime, their GCD is 1.',
      },
      {
        input: 'findGCD(100, 25)',
        output: '25',
        explanation: '25 divides 100 exactly, so the GCD is 25.',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'findGCD',
        starterCode: `/**
 * @param {number} a - First positive integer
 * @param {number} b - Second positive integer
 * @returns {number} The greatest common divisor of a and b
 */
function findGCD(a, b) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic example',
            args: [20, 15],
            expected: 5,
          },
          {
            name: 'larger numbers',
            args: [48, 18],
            expected: 6,
          },
          {
            name: 'coprime numbers',
            args: [17, 13],
            expected: 1,
          },
          {
            name: 'one divides other',
            args: [100, 25],
            expected: 25,
          },
          {
            name: 'same numbers',
            args: [42, 42],
            expected: 42,
          },
          {
            name: 'small numbers',
            args: [12, 8],
            expected: 4,
          },
        ],
      },
    },
  },
  {
    id: 'binary-tree-height',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Binary Tree Height',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Given the root node of a binary tree, return the height of the tree using recursion. Height is the number of levels on the longest path from the root down to a leaf. Return 0 for an empty tree.',
    constraints: [
      'Nodes are plain objects shaped like { value, left, right }',
      'left and right are either another node or null',
      'Must use recursion to explore subtrees',
      'Height counts levels, so a single node has height 1',
    ],
    examples: [
      {
        input:
          'treeHeight({ value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } })',
        output: '2',
      },
      {
        input:
          'treeHeight({ value: 7, left: { value: 4, left: { value: 3, left: null, right: null }, right: null }, right: null })',
        output: '3',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'treeHeight',
        starterCode: `/**
 * @param {{ value: any, left: object|null, right: object|null }|null} root - Root node of the binary tree
 * @returns {number} Height of the tree measured in levels
 */
function treeHeight(root) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'balanced tree',
            args: [
              {
                value: 1,
                left: {
                  value: 2,
                  left: {
                    value: 4,
                    left: null,
                    right: null,
                  },
                  right: {
                    value: 5,
                    left: null,
                    right: null,
                  },
                },
                right: {
                  value: 3,
                  left: null,
                  right: {
                    value: 6,
                    left: null,
                    right: null,
                  },
                },
              },
            ],
            expected: 3,
          },
          {
            name: 'single node',
            args: [
              {
                value: 10,
                left: null,
                right: null,
              },
            ],
            expected: 1,
          },
          {
            name: 'right skewed',
            args: [
              {
                value: 4,
                left: null,
                right: {
                  value: 5,
                  left: null,
                  right: {
                    value: 6,
                    left: null,
                    right: {
                      value: 7,
                      left: null,
                      right: null,
                    },
                  },
                },
              },
            ],
            expected: 4,
          },
          {
            name: 'empty tree',
            args: [null],
            expected: 0,
          },
          {
            name: 'unbalanced left heavy',
            args: [
              {
                value: 8,
                left: {
                  value: 3,
                  left: {
                    value: 1,
                    left: null,
                    right: null,
                  },
                  right: {
                    value: 6,
                    left: {
                      value: 4,
                      left: null,
                      right: null,
                    },
                    right: {
                      value: 7,
                      left: null,
                      right: null,
                    },
                  },
                },
                right: {
                  value: 10,
                  left: null,
                  right: {
                    value: 14,
                    left: {
                      value: 13,
                      left: null,
                      right: null,
                    },
                    right: null,
                  },
                },
              },
            ],
            expected: 4,
          },
        ],
      },
    },
  },
  {
    id: 'closest-pair-of-points',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Closest Pair of Points',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Given an array of 2D points, write a function `findClosestPair(points)` that finds the pair of points with the smallest distance between them. Return a string describing the result in the format: "closest points are index i and j coords: (x1,y1) and (x2,y2)".',
    constraints: [
      '2 <= points.length <= 1000',
      'Each point is represented as [x, y] where x and y are integers',
      '-1000 <= x, y <= 1000',
      'Return indices where i < j in the output string',
      'If multiple pairs have the same minimum distance, return any valid pair',
    ],
    examples: [
      {
        input: 'findClosestPair([[0, 0], [5, 4], [3, 1], [10, 10], [6, 2]])',
        output: '"closest points are index 1 and 4 coords: (5,4) and (6,2)"',
        explanation: 'Points at indices 1 and 4 have the smallest distance between them.',
      },
      {
        input: 'findClosestPair([[1, 1], [4, 4], [2, 2]])',
        output: '"closest points are index 0 and 2 coords: (1,1) and (2,2)"',
        explanation: 'Points [1, 1] and [2, 2] are closest.',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'findClosestPair',
        starterCode: `/**
 * @param {number[][]} points - Array of 2D points represented as [x, y]
 * @returns {string} String describing the closest pair with indices and coordinates
 */
function findClosestPair(points) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'basic example',
            args: [
              [
                [0, 0],
                [5, 4],
                [3, 1],
                [10, 10],
                [6, 2],
              ],
            ],
            expected: 'closest points are index 1 and 4 coords: (5,4) and (6,2)',
          },
          {
            name: 'three points',
            args: [
              [
                [1, 1],
                [4, 4],
                [2, 2],
              ],
            ],
            expected: 'closest points are index 0 and 2 coords: (1,1) and (2,2)',
          },
          {
            name: 'two points only',
            args: [
              [
                [0, 0],
                [1, 0],
              ],
            ],
            expected: 'closest points are index 0 and 1 coords: (0,0) and (1,0)',
          },
          {
            name: 'negative coordinates',
            args: [
              [
                [-1, -1],
                [1, 1],
                [0, 0],
              ],
            ],
            expected: 'closest points are index 0 and 2 coords: (-1,-1) and (0,0)',
          },
          {
            name: 'same x coordinate',
            args: [
              [
                [2, 0],
                [2, 3],
                [2, 1],
                [5, 5],
              ],
            ],
            expected: 'closest points are index 0 and 2 coords: (2,0) and (2,1)',
          },
        ],
      },
    },
  },
  {
    id: 'word-search-matrix',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Word Search in Matrix',
    difficulty: ProblemDifficulty.HARD,
    description:
      'Write a function `searchWord(pattern, matrix)` that searches for a given pattern (string) in a 2D character matrix. The pattern can be found in 8 directions. If found, return "found at (row, column) from direction". If not found, return "not found".',
    constraints: [
      '1 <= pattern.length <= 20',
      '1 <= matrix.length, matrix[0].length <= 20',
      'Matrix contains only lowercase letters',
      'Pattern contains only lowercase letters',
      'Search in all 8 directions',
      'Return format: "found at (row, column) from direction" or "not found"',
    ],
    examples: [
      {
        input: 'searchWord("hello", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"found at (0, 0) from left to right"',
        explanation: 'The word "hello" can be found horizontally starting at position (0,0).',
      },
      {
        input: 'searchWord("world", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"found at (1, 0) from left to right"',
        explanation: 'The word "world" can be found horizontally starting at position (1,0).',
      },
      {
        input: 'searchWord("xyz", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"not found"',
        explanation: 'The word "xyz" cannot be found in any direction.',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'searchWord',
        starterCode: `/**
 * @param {string} pattern - The word/pattern to search for
 * @param {string[][]} matrix - 2D array of characters
 * @returns {string} "found at (row, column) from direction" or "not found"
 */
function searchWord(pattern, matrix) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'horizontal left to right',
            args: [
              'hello',
              [
                ['h', 'e', 'l', 'l', 'o'],
                ['w', 'o', 'r', 'l', 'd'],
              ],
            ],
            expected: 'found at (0, 0) from left to right',
          },
          {
            name: 'horizontal right to left',
            args: [
              'olleh',
              [
                ['h', 'e', 'l', 'l', 'o'],
                ['w', 'o', 'r', 'l', 'd'],
              ],
            ],
            expected: 'found at (0, 4) from right to left',
          },
          {
            name: 'vertical top to bottom',
            args: [
              'hw',
              [
                ['h', 'e', 'l'],
                ['w', 'o', 'r'],
                ['z', 'x', 'y'],
              ],
            ],
            expected: 'found at (0, 0) from top to bottom',
          },
          {
            name: 'vertical bottom to top',
            args: [
              'wh',
              [
                ['h', 'e', 'l'],
                ['w', 'o', 'r'],
                ['z', 'x', 'y'],
              ],
            ],
            expected: 'found at (1, 0) from bottom to top',
          },
          {
            name: 'diagonal top-left to bottom-right',
            args: [
              'cat',
              [
                ['c', 'x', 'z', 'p'],
                ['y', 'a', 'q', 'r'],
                ['m', 'n', 't', 's'],
                ['u', 'v', 'w', 'k'],
              ],
            ],
            expected: 'found at (0, 0) from top-left to bottom-right',
          },
          {
            name: 'diagonal top-right to bottom-left',
            args: [
              'dog',
              [
                ['x', 'y', 'z', 'd'],
                ['a', 'b', 'o', 'c'],
                ['e', 'g', 'f', 'h'],
                ['i', 'j', 'k', 'l'],
              ],
            ],
            expected: 'found at (0, 3) from top-right to bottom-left',
          },
          {
            name: 'diagonal bottom-left to top-right',
            args: [
              'fun',
              [
                ['a', 'b', 'n', 'd'],
                ['e', 'u', 'g', 'h'],
                ['f', 'j', 'k', 'l'],
                ['m', 'o', 'p', 'q'],
              ],
            ],
            expected: 'found at (2, 0) from bottom-left to top-right',
          },
          {
            name: 'diagonal bottom-right to top-left',
            args: [
              'joy',
              [
                ['y', 'b', 'c', 'd'],
                ['e', 'o', 'g', 'h'],
                ['i', 'j', 'j', 'l'],
                ['m', 'n', 'p', 'q'],
              ],
            ],
            expected: 'found at (2, 2) from bottom-right to top-left',
          },
          {
            name: 'word at edge - horizontal',
            args: [
              'edge',
              [
                ['a', 'b', 'c', 'd'],
                ['e', 'd', 'g', 'e'],
                ['f', 'g', 'h', 'i'],
              ],
            ],
            expected: 'found at (1, 0) from left to right',
          },
          {
            name: 'word at corner - diagonal',
            args: [
              'ace',
              [
                ['a', 'x', 'y'],
                ['z', 'c', 'w'],
                ['q', 'r', 'e'],
              ],
            ],
            expected: 'found at (0, 0) from top-left to bottom-right',
          },
          {
            name: 'overlapping letters different direction',
            args: [
              'sun',
              [
                ['s', 'a', 'b'],
                ['u', 't', 'c'],
                ['n', 'e', 'f'],
              ],
            ],
            expected: 'found at (0, 0) from top to bottom',
          },
          {
            name: 'pattern not found',
            args: [
              'xyz',
              [
                ['h', 'e', 'l', 'l', 'o'],
                ['w', 'o', 'r', 'l', 'd'],
              ],
            ],
            expected: 'not found',
          },
          {
            name: 'empty pattern edge case',
            args: [
              '',
              [
                ['a', 'b'],
                ['c', 'd'],
              ],
            ],
            expected: 'not found',
          },
          {
            name: 'longer word reverse diagonal',
            args: [
              'magic',
              [
                ['x', 'y', 'z', 'w', 'm'],
                ['a', 'b', 'c', 'a', 'q'],
                ['p', 'q', 'g', 'r', 's'],
                ['t', 'i', 'u', 'v', 'w'],
                ['c', 'x', 'y', 'z', 'a'],
              ],
            ],
            expected: 'found at (0, 4) from top-right to bottom-left',
          },
        ],
      },
    },
  },
  {
    id: 'string-pattern-matching',
    classId: ProblemClassId.ALGORITHMS,
    title: 'Brute Force String Pattern Matching',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Write a function `findPattern(pattern, text)` that searches for a given pattern (substring) within a larger text string. Return "Found" if the pattern exists as a substring in the text, otherwise return "Not found".',
    constraints: [
      '1 <= pattern.length <= 100',
      '1 <= text.length <= 1000',
      'Both pattern and text contain only printable ASCII characters',
      'Search is case-sensitive',
      'Return exactly "Found" or "Not found"',
    ],
    isVisible: true,
    examples: [
      {
        input: 'findPattern("hello", "nnnhello")',
        output: '"Found"',
        explanation: 'The pattern "hello" exists at the end of "nnnhello".',
      },
      {
        input: 'findPattern("world", "hello there")',
        output: '"Not found"',
        explanation: 'The pattern "world" does not exist in "hello there".',
      },
      {
        input: 'findPattern("test", "this is a test case")',
        output: '"Found"',
        explanation: 'The pattern "test" exists in "this is a test case".',
      },
    ],
    languages: {
      javascript: {
        kind: 'call',
        functionName: 'findPattern',
        starterCode: `/**
 * @param {string} pattern - The pattern/substring to search for
 * @param {string} text - The text to search within
 * @returns {string} "Found" if pattern exists in text, "Not found" otherwise
 */
function findPattern(pattern, text) {
  // Your solution here
  
}`,
        tests: [
          {
            name: 'pattern at end',
            args: ['hello', 'nnnhello'],
            expected: 'Found',
          },
          {
            name: 'pattern not found',
            args: ['world', 'hello there'],
            expected: 'Not found',
          },
          {
            name: 'pattern in middle',
            args: ['test', 'this is a test case'],
            expected: 'Found',
          },
          {
            name: 'pattern at beginning',
            args: ['hello', 'hello world'],
            expected: 'Found',
          },
          {
            name: 'pattern equals text',
            args: ['abc', 'abc'],
            expected: 'Found',
          },
          {
            name: 'pattern longer than text',
            args: ['hello', 'hi'],
            expected: 'Not found',
          },
          {
            name: 'empty pattern',
            args: ['', 'hello'],
            expected: 'Found',
          },
          {
            name: 'case sensitive',
            args: ['Hello', 'hello world'],
            expected: 'Not found',
          },
        ],
      },
    },
  },
  {
    id: 'prime-factorization',
    classId: ProblemClassId.JAVA_FUNDAMENTALS,
    title: 'Prime Factorization',
    difficulty: ProblemDifficulty.EASY,
    description:
      'Read a single positive integer from stdin and print its prime factorization.\n\n**Input format:** one line holding a single integer `n`, where `n > 1`.\n\n**Output format:** one line listing every prime factor in ascending order, joined by ` * ` (a star with one space on each side).\n\nFor example, `360` factors into `2 * 2 * 2 * 3 * 3 * 5`.',
    constraints: [
      'Input is a single integer greater than 1',
      'Print the prime factors in ascending order',
      'Join the factors with a star, with one space on each side',
    ],
    examples: [
      {
        input: '360',
        output: '2 * 2 * 2 * 3 * 3 * 5',
      },
      {
        input: '32',
        output: '2 * 2 * 2 * 2 * 2',
      },
      {
        input: '14',
        output: '2 * 7',
      },
    ],
    languages: {
      java: {
        kind: 'stdio',
        starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your solution here

    }
}
`,
        tests: [
          {
            name: 'input 360',
            stdin: '360\n',
            expectedOutput: '2 * 2 * 2 * 3 * 3 * 5',
          },
          {
            name: 'input 14',
            stdin: '14\n',
            expectedOutput: '2 * 7',
          },
          {
            name: 'input 32',
            stdin: '32\n',
            expectedOutput: '2 * 2 * 2 * 2 * 2',
          },
          {
            name: 'input 1001',
            stdin: '1001\n',
            expectedOutput: '7 * 11 * 13',
          },
          {
            name: 'input 10000',
            stdin: '10000\n',
            expectedOutput: '2 * 2 * 2 * 2 * 5 * 5 * 5 * 5',
          },
          {
            name: 'input 210',
            stdin: '210\n',
            expectedOutput: '2 * 3 * 5 * 7',
          },
          {
            name: 'input 81',
            stdin: '81\n',
            expectedOutput: '3 * 3 * 3 * 3',
          },
          {
            name: 'input 19946',
            stdin: '19946\n',
            expectedOutput: '2 * 9973',
          },
          {
            name: 'input 11021',
            stdin: '11021\n',
            expectedOutput: '103 * 107',
          },
          {
            name: 'input 3628800',
            stdin: '3628800\n',
            expectedOutput: '2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 3 * 3 * 3 * 3 * 5 * 5 * 7',
          },
          {
            name: 'input 111111',
            stdin: '111111\n',
            expectedOutput: '3 * 7 * 11 * 13 * 37',
          },
        ],
      },
    },
  },
  {
    id: 'string-combination',
    classId: ProblemClassId.JAVA_FUNDAMENTALS,
    title: 'String Combination',
    difficulty: ProblemDifficulty.EASY,
    description:
      'Read two lines from stdin and merge them into one combined string.\n\nFirst, reverse the second line. Then build the output by alternating characters: the 1st character of line 1, the 1st character of the reversed line 2, the 2nd character of line 1, and so on. Once one side runs out of characters, append the rest of the other side unchanged.\n\n**Example:** line 1 is `ABCD` and line 2 is `1234` — reversed line 2 is `4321` — so the merged output is `A4B3C2D1`.',
    constraints: [
      'Read exactly two whole lines (inputs may contain spaces, so read full lines)',
      'Reverse the second line before merging',
      'Alternate characters, then append the leftover tail of the longer side',
    ],
    examples: [
      {
        input: 'ABCD\n1234',
        output: 'A4B3C2D1',
      },
      {
        input: 'Programming\nJava',
        output: 'ParvoagJramming',
      },
    ],
    languages: {
      java: {
        kind: 'stdio',
        starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your solution here

    }
}
`,
        tests: [
          {
            name: 'ABCD / 1234',
            stdin: 'ABCD\n1234\n',
            expectedOutput: 'A4B3C2D1',
          },
          {
            name: 'Programming / Java',
            stdin: 'Programming\nJava\n',
            expectedOutput: 'ParvoagJramming',
          },
          {
            name: 'A / IsTheFirstAlphabetInEnglish',
            stdin: 'A\nIsTheFirstAlphabetInEnglish\n',
            expectedOutput: 'AhsilgnEnItebahplAtsriFehTsI',
          },
          {
            name: 'CS@SIT / KMUTT',
            stdin: 'CS@SIT\nKMUTT\n',
            expectedOutput: 'CTST@USMIKT',
          },
          {
            name: 'YouGood??? / symbols',
            stdin: 'YouGood???\n$#%&&@#@#%&#@$&\n',
            expectedOutput: 'Y&o$u@G#o&o%d#?@?#?@&&%#$',
          },
          {
            name: '1234 / abcdefghijk',
            stdin: '1234\nabcdefghijk\n',
            expectedOutput: '1k2j3i4hgfedcba',
          },
        ],
      },
    },
  },
  {
    id: 'molecular-mass',
    classId: ProblemClassId.JAVA_FUNDAMENTALS,
    title: 'Molecular Mass',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Read a chemical formula from stdin and print its total molecular mass.\n\nAtomic masses: `H = 1`, `C = 12`, `O = 16`.\n\n- A letter may be followed by a count, which can have more than one digit (`C100` means 100 carbon atoms).\n- A letter with no number after it counts exactly once (the `O` in `H2O` is 1 oxygen).\n- Only `H`, `C`, and `O` are valid. Anything else — an unknown atom like `S`, a lowercase letter like `h`, or a symbol like `!` — makes the whole answer exactly `Error`.\n\n**Examples:** `H2O` gives `18`. `H2SO4` gives `Error` because `S` is unknown.',
    constraints: [
      'Only H, C, and O are valid atoms',
      'A number right after a letter is that atom’s count (multi-digit allowed); no number means 1',
      'Any other character makes the output exactly Error',
    ],
    examples: [
      {
        input: 'H2O',
        output: '18',
      },
      {
        input: 'C2H5OH',
        output: '46',
      },
      {
        input: 'H2SO4',
        output: 'Error',
      },
    ],
    languages: {
      java: {
        kind: 'stdio',
        starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your solution here

    }
}
`,
        tests: [
          {
            name: 'H2O',
            stdin: 'H2O\n',
            expectedOutput: '18',
          },
          {
            name: 'CO',
            stdin: 'CO\n',
            expectedOutput: '28',
          },
          {
            name: 'O',
            stdin: 'O\n',
            expectedOutput: '16',
          },
          {
            name: 'O2',
            stdin: 'O2\n',
            expectedOutput: '32',
          },
          {
            name: 'C6H12O6',
            stdin: 'C6H12O6\n',
            expectedOutput: '180',
          },
          {
            name: 'C100',
            stdin: 'C100\n',
            expectedOutput: '1200',
          },
          {
            name: 'C2H5OH',
            stdin: 'C2H5OH\n',
            expectedOutput: '46',
          },
          {
            name: 'unknown atom S',
            stdin: 'H2SO4\n',
            expectedOutput: 'Error',
          },
          {
            name: 'lowercase',
            stdin: 'h2o\n',
            expectedOutput: 'Error',
          },
          {
            name: 'symbol',
            stdin: 'H2O!\n',
            expectedOutput: 'Error',
          },
        ],
      },
    },
  },
  {
    id: 'box-office-revenue',
    classId: ProblemClassId.JAVA_FUNDAMENTALS,
    title: 'Box Office Revenue',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'There are `n` fans waiting in a single-file line, numbered `1` to `n`. Read `n` on line 1 and the target revenue on line 2, then serve the fans in order.\n\nAfter every fan, check the revenue total: as soon as it reaches or passes the target, the booth closes at once and the remaining fans get nothing. The check also happens before the first fan, so a target of `0` or less would serve nobody — but the given targets are always positive.\n\nEach fan’s ticket depends on their position (first matching rule wins):\n\n- Multiple of **both 3 and 7** (e.g. 21): Golden Ticket — free, and revenue **drops by $20** (`-20`).\n- Multiple of **7 only**: Backstage Pass — `$150`.\n- Multiple of **3 only**: Premium Upgrade — `$80`.\n- Anyone else: Standard Ticket — `$50`.\n\n**Output:** line 1 is `$` followed by the final revenue; line 2 is how many fans got a ticket (Golden Ticket winners count too).\n\n**Worked example:** `10` fans, target `300`. Fans 1–2 pay standard (total `100`), fan 3 pays premium (`180`), fans 4–5 pay standard (`280`), fan 6 pays premium (`360`). `360` reaches the target, so the booth closes: `$360` and `6` tickets.',
    constraints: [
      '1 <= n <= 10000; target is between $100 and $1,000,000',
      'Serve fans in order starting from 1; stop as soon as revenue reaches the target',
      'Golden (3 and 7): -20. Backstage (7 only): $150. Premium (3 only): $80. Standard: $50',
    ],
    examples: [
      {
        input: '10\n300',
        output: '$360\n6',
      },
    ],
    languages: {
      java: {
        kind: 'stdio',
        starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your solution here

    }
}
`,
        tests: [
          {
            name: '10 fans, target 300',
            stdin: '10\n300\n',
            expectedOutput: '$360\n6',
          },
          {
            name: '25 fans, target 1500',
            stdin: '25\n1500\n',
            expectedOutput: '$1540\n24',
          },
          {
            name: '5 fans, target 1000',
            stdin: '5\n1000\n',
            expectedOutput: '$280\n5',
          },
          {
            name: '10 fans, target 230',
            stdin: '10\n230\n',
            expectedOutput: '$230\n4',
          },
          {
            name: '10 fans, target 500',
            stdin: '10\n500\n',
            expectedOutput: '$510\n7',
          },
          {
            name: '30 fans, target 1400',
            stdin: '30\n1400\n',
            expectedOutput: '$1410\n22',
          },
          {
            name: '1 fan, target 200',
            stdin: '1\n200\n',
            expectedOutput: '$50\n1',
          },
          {
            name: '100 fans, target 50',
            stdin: '100\n50\n',
            expectedOutput: '$50\n1',
          },
        ],
      },
    },
  },
  {
    id: 'seating-chart',
    classId: ProblemClassId.JAVA_FUNDAMENTALS,
    title: 'Seating Chart',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'The venue has `R` rows (front to back, numbered from 1) and `C` seats per row (left to right, numbered from 1). Read `R` on line 1 and `C` on line 2.\n\nCategorize every seat by the **first** rule that matches, from top to bottom:\n\n1. **Front Row** — any seat in row 1 is a VIP seat: symbol `V`, price `$100`.\n2. **Aisle Seats** — seat 1 or seat `C` of a row: symbol `A`, price `$75`.\n3. **Lucky Diagonal** — the row number equals the seat number (e.g. row 3, seat 3): symbol `L`, price `$50`.\n4. **Standard** — everything else: symbol `S`, price `$30`.\n\n**Output:** print the seating map — one line per row, seats separated by a single space — then a final line `Total Potential Revenue: $<sum>`.\n\n**Worked example:** `4` rows, `5` seats. Row 1 is all `V` (front row): `5 x $100 = $500`. Row 2 is `A L S S A`: `$75 + $50 + $30 + $30 + $75 = $260`. Rows 3 and 4 follow the same pattern (`$260` each). Total: `$500 + $260 + $260 + $260 = $1280`.',
    constraints: [
      '1 <= R <= 50; 1 <= C <= 50',
      'Apply the rules in this order: Front Row, then Aisle, then Lucky Diagonal, then Standard',
      'Row 1 is always entirely V seats',
      'Print one venue row per output line, seats separated by a single space',
    ],
    examples: [
      {
        input: '4\n5',
        output: 'V V V V V\nA L S S A\nA S L S A\nA S S L A\nTotal Potential Revenue: $1280',
      },
      {
        input: '1\n1',
        output: 'V\nTotal Potential Revenue: $100',
      },
    ],
    languages: {
      java: {
        kind: 'stdio',
        starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your solution here

    }
}
`,
        tests: [
          {
            name: '4 rows, 5 seats',
            stdin: '4\n5\n',
            expectedOutput:
              'V V V V V\nA L S S A\nA S L S A\nA S S L A\nTotal Potential Revenue: $1280',
          },
          {
            name: '3 rows, 3 seats',
            stdin: '3\n3\n',
            expectedOutput: 'V V V\nA L A\nA S A\nTotal Potential Revenue: $680',
          },
          {
            name: '4 rows, 4 seats',
            stdin: '4\n4\n',
            expectedOutput: 'V V V V\nA L S A\nA S L A\nA S S A\nTotal Potential Revenue: $1070',
          },
          {
            name: '1 row, 1 seat',
            stdin: '1\n1\n',
            expectedOutput: 'V\nTotal Potential Revenue: $100',
          },
          {
            name: '5 rows, 1 seat',
            stdin: '5\n1\n',
            expectedOutput: 'V\nA\nA\nA\nA\nTotal Potential Revenue: $400',
          },
          {
            name: '1 row, 6 seats',
            stdin: '1\n6\n',
            expectedOutput: 'V V V V V V\nTotal Potential Revenue: $600',
          },
          {
            name: '3 rows, 6 seats',
            stdin: '3\n6\n',
            expectedOutput: 'V V V V V V\nA L S S S A\nA S L S S A\nTotal Potential Revenue: $1180',
          },
          {
            name: '5 rows, 3 seats',
            stdin: '5\n3\n',
            expectedOutput: 'V V V\nA L A\nA S A\nA S A\nA S A\nTotal Potential Revenue: $1040',
          },
        ],
      },
    },
  },
];

export const getProblem = (id: string, options: { includeHidden?: boolean } = {}) => {
  const { includeHidden = false } = options;
  const problem = problems.find((p) => p.id === id) || null;

  if (!includeHidden && problem && !isProblemVisible(problem)) {
    return null;
  }

  return problem;
};

export const getAllProblems = (options: { includeHidden?: boolean } = {}) => {
  const { includeHidden = false } = options;

  if (includeHidden) {
    return [...problems];
  }

  return problems.filter(isProblemVisible);
};

export const getProblemsByClass = (classId: string, options: { includeHidden?: boolean } = {}) =>
  getAllProblems(options).filter((p) => p.classId === classId);

export const getSortedProblems = (
  hardestFirst = false,
  options: { includeHidden?: boolean; problems?: Problem[] } = {},
) => {
  const { includeHidden = false, problems: baseProblems } = options;
  const problemsToSort = baseProblems
    ? includeHidden
      ? [...baseProblems]
      : baseProblems.filter(isProblemVisible)
    : getAllProblems({ includeHidden });

  const difficultyOrder = {
    [ProblemDifficulty.EASY]: 1,
    [ProblemDifficulty.MEDIUM]: 2,
    [ProblemDifficulty.HARD]: 3,
  };

  return [...problemsToSort].sort((a, b) => {
    const orderA = difficultyOrder[a.difficulty] || 0;
    const orderB = difficultyOrder[b.difficulty] || 0;

    return hardestFirst ? orderB - orderA : orderA - orderB;
  });
};
