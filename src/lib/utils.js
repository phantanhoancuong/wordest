import { WORD_LENGTH, CellAnimation, CellStatus } from "../lib/constants";

/**
 * Counts the occurrences of each letter in a word.
 *
 * @param {string} word - The word to count letters from.
 * @returns {Record<string, number>} An object mapping each letter to its frequency.
 */
export const countLetter = (word) => {
  const count = {};
  for (const char of word) {
    count[char] = (count[char] || 0) + 1;
  }
  return count;
};

/**
 * Creates an empty 2D grid of cell objects.
 *
 * Each cell includes default `char`, `status`, `animation`, and `animationDelay` values.
 *
 * @param {number} rowNum - Number of rows in the grid.
 * @param {number} colNum - Number of columns in the grid.
 * @param {string} [defaultStatus=CellStatus.DEFAULT] - Default cell status.
 * @param {string} [defaultAnimation=CellAnimation.NONE] - Default animation type.
 * @param {number} [animationDelay=0] - Default animation delay (in seconds).
 * @returns {Array<Array<Object>>} A 2D array representing the initialized grid.
 */
export const initEmptyGrid = (
  rowNum,
  colNum,
  defaultStatus = CellStatus.DEFAULT,
  defaultAnimation = CellAnimation.NONE,
  animationDelay = 0
) => {
  return Array.from({ length: rowNum }, () =>
    Array.from({ length: colNum }, () => ({
      char: "",
      status: defaultStatus,
      animation: defaultAnimation,
      animationDelay,
    }))
  );
};

/**
 * Evaluates a guessed word against the target word.
 *
 * Returns an array of `CellStatus` values representing the accuracy of each letter.
 *
 * @param {string} guess - The guessed word.
 * @param {string} targetWord - The target word to compare against.
 * @param {Record<string, number>} targetLetterCount - Letter frequency map of the target word.
 * @returns {string[]} Array of `CellStatus` values for each letter.
 */
export const evaluateGuess = (guess, targetWord, targetLetterCount) => {
  const tempLetterCount = { ...targetLetterCount };
  const statuses = Array(WORD_LENGTH).fill(CellStatus.ABSENT);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === targetWord[i]) {
      statuses[i] = CellStatus.CORRECT;
      tempLetterCount[guess[i]] -= 1;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (statuses[i] === CellStatus.CORRECT) continue;
    if (tempLetterCount[guess[i]] > 0) {
      statuses[i] = CellStatus.PRESENT;
      tempLetterCount[guess[i]] -= 1;
    }
  }

  return statuses;
};

/**
 * Maps a guessed word and its evaluation statuses into an array of cell objects.
 *
 * Useful for rendering animated rows in the game grid.
 *
 * @param {string} guess - The guessed word.
 * @param {string[]} statuses - Array of `CellStatus` values for each character.
 * @param {Object} [options={}] - Optional animation configuration.
 * @param {string} [options.animation=CellAnimation.NONE] - Animation applied to each cell.
 * @param {number} [options.animationDelay=0] - Base animation delay (in seconds).
 * @param {boolean} [options.isConsecutive=false] - If true, delay increases per cell index.
 * @returns {Array<Object>} Array of cell objects representing the row.
 */
export const mapGuessToRow = (
  guess,
  statuses,
  {
    animation = CellAnimation.NONE,
    animationDelay = 0,
    isConsecutive = false,
  } = {}
) => {
  return guess.split("").map((char, i) => ({
    char,
    status: statuses[i],
    animation,
    animationDelay: isConsecutive ? i * animationDelay : animationDelay,
  }));
};
