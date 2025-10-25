import { WORD_LENGTH, CellAnimation, CellStatus } from "../lib/constants";

/**
 * Counts the occurences of each letter in a given word.
 *
 * @param {string} word - The word to count letters in.
 * @returns {Object<string, number>} Object mapping each letter to its count.
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
 * Each cell has default character, status, animation, and animation delay.
 *
 * @param {number} rowNum - Number of rows in the grid.
 * @param {number} colNum - Number of columns in the grid.
 * @param {string} [defaultStatus=CellStatus.DEFAULT] - Default status for each cell.
 * @param {string} [defaulAnimation=CellAnimation.NONE] - Default animation for each cell.
 * @param {number} [animationDelay=0] - Default animation delay for each cell (ms).
 * @returns {Array<Array<Object>>} 2D array representing the grid.
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
      animationDelay: animationDelay,
    }))
  );
};

/**
 * Evaluates a guess against the target word.
 *
 * Determines each letter's status.
 * @param {string} guess - The guessed word.
 * @param {string} targetWord - The target word to compare against.
 * @param {Object<string, number>} targetLetterCount - Letter counts of the target word.
 * @returns {Array<string>} Array of CellStatus values for each letter in the guess.
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
 * Converts a guess string and evaluation statuses into a row of cell objects with animation properties.
 *
 * @param {string} guess - The guessed word.
 * @param {Array<string>} statuses - Array of CellStatus values for each character.
 * @param {Object} [options] - Optional animation settings.
 * @property {string} [options.animation=CellAnimation.NONE] - The animation to apply to each cell.
 * @property {number} [options.animationDelay=0] - Base delay in seconds for animations.
 * @property {boolean} [options.isConsecutive=true] - If true, delay increases per cell.
 * @returns
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
