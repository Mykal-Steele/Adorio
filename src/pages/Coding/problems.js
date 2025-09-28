import { ProblemDifficulty } from './types.js';

/**
 * Coding problems data - easy to extend with new problems
 * Each problem follows a consistent structure for maintainability
 */
export const problems = [
  {
    id: 'odd-numbers',
    title: 'Generate Odd Numbers',
    difficulty: ProblemDifficulty.EASY,
    functionName: 'printOddNumbers',
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
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: ProblemDifficulty.EASY,
    functionName: 'reverseString',
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
  {
    id: 'prime-generator-brute',
    title: 'Generate Primes (Brute Force)',
    difficulty: ProblemDifficulty.MEDIUM,
    functionName: 'generatePrimes',
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
  {
    id: 'tower-of-hanoi',
    title: 'Tower of Hanoi Solver',
    difficulty: ProblemDifficulty.HARD,
    functionName: 'TowerOfHanoi',
    methodName: 'play',
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
  {
    id: 'matrix-multiplication',
    title: 'Matrix Multiplication',
    difficulty: ProblemDifficulty.MEDIUM,
    functionName: 'multiplyMatrices',
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
        input:
          'searchWord("hello", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"found at (0, 0) from left to right"',
        explanation:
          'The word "hello" can be found horizontally starting at position (0,0).',
      },
      {
        input:
          'searchWord("world", [["h","e","l","l","o"], ["w","o","r","l","d"]])',
        output: '"found at (1, 0) from left to right"',
        explanation:
          'The word "world" can be found horizontally starting at position (1,0).',
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
        expected: 'found at (2, 1) from bottom-right to top-left',
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

/**
 * Sort problems by difficulty level
 * @param {boolean} hardestFirst - If true, sorts from hardest to easiest. If false, sorts from easiest to hardest
 * @returns {Array<Problem>} Sorted problems array
 */
export const getSortedProblems = (hardestFirst = false) => {
  const difficultyOrder = {
    [ProblemDifficulty.EASY]: 1,
    [ProblemDifficulty.MEDIUM]: 2,
    [ProblemDifficulty.HARD]: 3,
  };

  return [...problems].sort((a, b) => {
    const orderA = difficultyOrder[a.difficulty] || 0;
    const orderB = difficultyOrder[b.difficulty] || 0;

    return hardestFirst ? orderB - orderA : orderA - orderB;
  });
};
