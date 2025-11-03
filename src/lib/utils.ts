import { CellStatusType, CellAnimationType, Cell } from "@/types/cell";
import { WORD_LENGTH, CellAnimation, CellStatus } from "./constants";

/**
 * Counts the occurrences of each letter in a word.
 *
 * @param word - The word to count letters from.
 * @returns An object mapping each letter to its frequency.
 */
export const countLetter = (word: string): Record<string, number> => {
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
 * @param rowNum - Number of rows in the grid.
 * @param colNum - Number of columns in the grid.
 * @param defaultStatus- Default cell status.
 * @param defaultAnimation - Default animation type.
 * @param animationDelay - Default animation delay (in seconds).
 * @returns A 2D array representing the initialized grid.
 */
export const initEmptyGrid = (
  rowNum: number,
  colNum: number,
  defaultStatus: CellStatusType = CellStatus.DEFAULT,
  defaultAnimation: CellAnimationType = CellAnimation.NONE,
  animationDelay = 0
): Array<Array<Cell>> => {
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
 * @param guess - The guessed word.
 * @param targetWord - The target word to compare against.
 * @param targetLetterCount - Letter frequency map of the target word.
 * @returns Array of `CellStatus` values for each letter.
 */
export const evaluateGuess = (
  guess: string,
  targetWord: string,
  targetLetterCount: Record<string, number>
): Array<CellStatusType> => {
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

interface MapGuessToRowOptions {
  animation?: CellAnimationType;
  animationDelay?: number;
  isConsecutive?: boolean;
}

/**
 * Maps a guessed word and its evaluation statuses into an array of cell objects.
 *
 * Useful for rendering animated rows in the game grid.
 *
 * @param guess - The guessed word.
 * @param statuses - Array of `CellStatus` values for each character.
 * @param options - Optional animation configuration.
 * @returns Array of cell objects representing the row.
 */
export const mapGuessToRow = (
  guess: string,
  statuses: Array<CellStatusType>,
  options: MapGuessToRowOptions = {}
): Array<Cell> => {
  const {
    animation = CellAnimation.NONE,
    animationDelay = 0,
    isConsecutive = false,
  } = options;
  return guess.split("").map((char, i) => ({
    char,
    status: statuses[i],
    animation,
    animationDelay: isConsecutive ? i * animationDelay : animationDelay,
  }));
};
