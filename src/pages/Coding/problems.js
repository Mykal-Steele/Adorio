import { ProblemDifficulty } from './types.js';

/**
 * Coding problems data - easy to extend with new problems
 * Each problem follows a consistent structure for maintainability
 */
export const problems = [
  {
    id: 'odd-numbers',
    title: 'Print Odd Numbers',
    difficulty: ProblemDifficulty.BEGINNER,
    functionName: 'printOddNumbers',
    description:
      'Write a function `printOddNumbers(n)` that returns an array of all odd numbers from 1 to n (inclusive). If n is less than 1, return an empty array.',
    constraints: [
      '1 <= n <= 1000',
      'Input will always be a finite number',
      'Return a new array; do not mutate inputs',
    ],
    examples: [
      {
        input: 'printOddNumbers(10)',
        output: '[1, 3, 5, 7, 9]',
        explanation: 'All odd numbers from 1 to 10.',
      },
      {
        input: 'printOddNumbers(5)',
        output: '[1, 3, 5]',
        explanation: 'All odd numbers from 1 to 5.',
      },
      {
        input: 'printOddNumbers(0)',
        output: '[]',
        explanation: 'Returns empty array for n <= 0.',
      },
    ],
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
        name: 'edge case zero',
        args: [0],
        expected: [],
      },
      {
        name: 'single odd',
        args: [1],
        expected: [1],
      },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: ProblemDifficulty.BEGINNER,
    functionName: 'reverseString',
    description:
      'Write a function `reverseString(str)` that returns the input string reversed. Handle empty strings by returning an empty string.',
    constraints: [
      'Input will always be a string',
      'Return a new string',
      'Do not mutate the input',
    ],
    examples: [
      {
        input: 'reverseString("hello")',
        output: '"olleh"',
        explanation: 'Reverse the string "hello" to get "olleh".',
      },
      {
        input: 'reverseString("")',
        output: '""',
        explanation: 'Empty string returns empty string.',
      },
    ],
    starterCode: `/**
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 */
function reverseString(str) {
  // Your solution here
  
}`,
    tests: [
      { name: 'basic', args: ['hello'], expected: 'olleh' },
      { name: 'empty', args: [''], expected: '' },
      { name: 'single', args: ['a'], expected: 'a' },
      { name: 'palindrome', args: ['racecar'], expected: 'racecar' },
    ],
  },
  {
    id: 'prime-generator-brute',
    title: 'Prime Generator (Brute Force)',
    difficulty: ProblemDifficulty.EASY,
    description:
      'Generate all prime numbers between 2 and n (inclusive) using **brute force method**.',
    functionName: 'generatePrimes',
    starterCode: `/**
 * @param {number} n - The upper limit (inclusive)
 * @returns {number[]} Array of prime numbers from 2 to n using brute force
 */
function generatePrimes(n) {
  // Your solution here
  
}`,
    constraints: [
      '0 <= n <= 1000',
      'Must use brute force approach',
      'Return a new array',
      'Do not mutate inputs',
    ],
    examples: [
      {
        input: 'generatePrimes(10)',
        output: '[2, 3, 5, 7]',
        explanation: 'All prime numbers from 2 up to 10 using brute force.',
      },
      {
        input: 'generatePrimes(2)',
        output: '[2]',
        explanation: 'Only 2 is prime up to 2.',
      },
    ],
    tests: [
      { name: 'basic', args: [10], expected: [2, 3, 5, 7] },
      { name: 'edge', args: [2], expected: [2] },
      { name: 'empty', args: [1], expected: [] },
      {
        name: 'medium',
        args: [30],
        expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
      },
    ],
  },
  {
    id: 'prime-sieve',
    title: 'Prime Generator (Sieve of Eratosthenes)',
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      'Generate all prime numbers between 2 and n (inclusive) using the **Sieve of Eratosthenes algorithm**. Return an empty array if n < 2.',
    functionName: 'sieveOfEratosthenes',
    starterCode: `/**
 * @param {number} n - The upper limit (inclusive)
 * @returns {number[]} Array of prime numbers from 2 to n using Sieve of Eratosthenes
 */
function sieveOfEratosthenes(n) {
  // Your solution here
  
}`,
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
    tests: [
      { name: 'basic', args: [10], expected: [2, 3, 5, 7] },
      { name: 'small', args: [2], expected: [2] },
      { name: 'empty', args: [1], expected: [] },
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
    ],
  },
  {
    id: 'tower-of-hanoi',
    title: 'Tower of Hanoi',
    difficulty: ProblemDifficulty.HARD,
    functionName: 'TowerOfHanoi',
    methodName: 'play',
    description:
      'Implement a Tower of Hanoi class that can solve the classic puzzle. The class should have three pegs (A, B, C) and track the number of moves. The `play` method should solve the puzzle and **return the total number of moves** it took. You can use the provided `showTowerOfHanoi` method for visualization (optional).',
    constraints: [
      '1 <= numberOfDisks <= 10',
      'Disks are numbered from 1 (smallest) to n (largest)',
      'Only move one disk at a time',
      'Never place a larger disk on top of a smaller one',
      'Start with all disks on peg A, move to peg C',
    ],
    examples: [
      {
        input: 'new TowerOfHanoi(3).play()',
        output: '7',
        explanation:
          'Returns 7 moves to solve 3-disk tower (2^3 - 1 = 7 moves).',
      },
      {
        input: 'new TowerOfHanoi(2).play()',
        output: '3',
        explanation:
          'Returns 3 moves to solve 2-disk tower (2^2 - 1 = 3 moves).',
      },
      {
        input: 'new TowerOfHanoi(1).play()',
        output: '1',
        explanation: 'Returns 1 move to solve 1-disk tower (2^1 - 1 = 1 move).',
      },
    ],
    starterCode: `/**
 * Tower of Hanoi 
 * @param {number} numberOfDisks - Number of disks to solve for
 */
class TowerOfHanoi {
  constructor(disk) {
   
  }

  /**
   * @return {number} ithMove - number of moves it took to solve
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
        name: 'solve 1 disk',
        args: [1],
        expected: 1, // Expected number of moves
      },
      {
        name: 'solve 2 disks',
        args: [2],
        expected: 3,
      },
      {
        name: 'solve 3 disks',
        args: [3],
        expected: 7,
      },
    ],
  },
  {
    id: 'matrix-multiplication',
    title: 'Matrix Multiplication',
    difficulty: ProblemDifficulty.MEDIUM,
    functionName: 'multiplyMatrices',
    description:
      'Write a function `multiplyMatrices(A, B)` that performs matrix multiplication on two 2D arrays. Matrix A has dimensions m×n and matrix B has dimensions n×p. The result should be a matrix C with dimensions m×p. Each element C[i][j] is computed as the sum of products of corresponding elements from row i of A and column j of B.',
    constraints: [
      'Matrix A dimensions: m × n (where m ≥ 1, n ≥ 1)',
      'Matrix B dimensions: n × p (where p ≥ 1)',
      'All input matrices will be valid for multiplication (A columns = B rows)',
      'All matrix elements are integers',
      'Return a new 2D array; do not mutate inputs',
    ],
    examples: [
      {
        input: 'multiplyMatrices([[1, 2], [3, 4]], [[5, 6], [7, 8]])',
        output: '[[19, 22], [43, 50]]',
        explanation:
          'Multiply 2×2 matrices: (1×5 + 2×7)=19, (1×6 + 2×8)=22, etc.',
      },
      {
        input: 'multiplyMatrices([[1, 2, 3]], [[4], [5], [6]])',
        output: '[[32]]',
        explanation:
          'Multiply 1×3 matrix with 3×1 matrix: (1×4 + 2×5 + 3×6)=32.',
      },
      {
        input:
          'multiplyMatrices([[1, 2], [3, 4], [5, 6]], [[10, 20, 30, 40], [50, 60, 70, 80]])',
        output:
          '[[110, 140, 170, 200], [230, 300, 370, 440], [350, 460, 570, 680]]',
        explanation:
          'Multiply 3×2 matrix with 2×4 matrix resulting in 3×4 matrix.',
      },
    ],
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
        name: 'basic 2x2 multiplication',
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
        name: 'vector multiplication',
        args: [[[1, 2, 3]], [[4], [5], [6]]],
        expected: [[32]],
      },
      {
        name: 'rectangular matrices',
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
        name: 'identity matrix',
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
        name: 'single element',
        args: [[[3]], [[7]]],
        expected: [[21]],
      },
    ],
  },
  {
    id: 'greatest-common-divisor',
    title: 'Greatest Common Divisor',
    difficulty: ProblemDifficulty.MEDIUM,
    functionName: 'findGCD',
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
  {
    id: 'closest-pair-of-points',
    title: 'Closest Pair of Points',
    difficulty: ProblemDifficulty.MEDIUM,
    functionName: 'findClosestPair',
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
        explanation:
          'Points at indices 1 and 4 have the smallest distance between them.',
      },
      {
        input: 'findClosestPair([[1, 1], [4, 4], [2, 2]])',
        output: '"closest points are index 0 and 2 coords: (1,1) and (2,2)"',
        explanation: 'Points [1, 1] and [2, 2] are closest.',
      },
    ],
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
  {
    id: 'word-search-matrix',
    title: 'Word Search in Matrix',
    difficulty: ProblemDifficulty.HARD,
    functionName: 'searchWord',
    description:
      'Write a function `searchWord(pattern, matrix)` that searches for a given pattern (string) in a 2D character matrix. The pattern can be found in 8 directions: horizontally (left-to-right, right-to-left), vertically (top-to-bottom, bottom-to-top), and diagonally (in all 4 diagonal directions). Return "found" if the pattern exists in any direction, otherwise return "not found".',
    constraints: [
      '1 <= pattern.length <= 20',
      '1 <= matrix.length, matrix[0].length <= 20',
      'Matrix contains only lowercase letters',
      'Pattern contains only lowercase letters',
      'Search in all 8 directions',
    ],
    examples: [
      {
        input:
          'searchWord("hello", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"found"',
        explanation:
          'The word "hello" can be found horizontally in the first row.',
      },
      {
        input:
          'searchWord("world", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"found"',
        explanation:
          'The word "world" can be found horizontally in the second row.',
      },
      {
        input:
          'searchWord("xyz", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"not found"',
        explanation: 'The word "xyz" cannot be found in any direction.',
      },
    ],
    starterCode: `/**
 * @param {string} pattern - The word/pattern to search for
 * @param {string[][]} matrix - 2D array of characters
 * @returns {string} "found" if pattern exists, "not found" otherwise
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
        expected: 'found',
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
        name: 'vertical top to bottom',
        args: [
          'hw',
          [
            ['h', 'e', 'l'],
            ['w', 'o', 'r'],
          ],
        ],
        expected: 'found',
      },
      {
        name: 'diagonal pattern',
        args: [
          'nlz',
          [
            ['n', 'n', 'n', 'h'],
            ['e', 'l', 'l', 'o'],
            ['x', 'y', 'z', 'o'],
            ['h', 'e', 'l', 'l'],
          ],
        ],
        expected: 'found',
      },
      {
        name: 'single character',
        args: [
          'a',
          [
            ['a', 'b'],
            ['c', 'd'],
          ],
        ],
        expected: 'found',
      },
      {
        name: 'reverse horizontal',
        args: [
          'olleh',
          [
            ['h', 'e', 'l', 'l', 'o'],
            ['w', 'o', 'r', 'l', 'd'],
          ],
        ],
        expected: 'found',
      },
    ],
  },
  {
    id: 'string-pattern-matching',
    title: 'Brute Force String Pattern Matching',
    difficulty: ProblemDifficulty.MEDIUM,
    functionName: 'findPattern',
    description:
      'Write a function `findPattern(pattern, text)` that searches for a given pattern (substring) within a larger text string. Return "Found" if the pattern exists as a substring in the text, otherwise return "Not found".',
    constraints: [
      '1 <= pattern.length <= 100',
      '1 <= text.length <= 1000',
      'Both pattern and text contain only printable ASCII characters',
      'Search is case-sensitive',
      'Return exactly "Found" or "Not found"',
    ],
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
];

/**
 * Get problem by ID
 * @param {string} id - Problem identifier
 * @returns {Problem|null} Problem or null if not found
 */
export const getProblem = (id) => {
  return problems.find((p) => p.id === id) || null;
};

/**
 * Get all available problems
 * @returns {Array<Problem>} All problems
 */
export const getAllProblems = () => problems;
