import { WORD_LENGTH, CellAnimation, CellStatus } from "@/lib/constants";

import {
  CellAnimationType,
  CellStatusType,
  DataCell,
  RenderCell,
} from "@/types/cell";

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
 * Convert a 2D grid of DataCell to a 2d grid of RenderCell[][].
 *
 * - Adds in default animation information ready to be rendered.
 *
 * @param dataGrid - The DataCell grid to be converted.
 * @param animation - The initial animation value for the cells.
 * @param animationDelay - The initial animation delay for the cells.
 * @returns A 2D RenderCell grid.
 */
export const dataGridToRenderGrid = (
  dataGrid: DataCell[][],
  animation: CellAnimationType,
  animationDelay: number
): RenderCell[][] => {
  return dataGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      animation,
      animationDelay,
    }))
  );
};

/**
 * Convert a 2D RenderCell grid back to a 2D DataCell grid.
 *
 * - Strips out animation-related properties.
 *
 * @param renderGrid - The RenderCell grid to be converted.
 * @returns A 2D DataCell grid.
 */
export const renderGridToDataGrid = (
  renderGrid: RenderCell[][]
): DataCell[][] => {
  return renderGrid.map((row) =>
    row.map(({ char, status }) => ({
      char,
      status,
    }))
  );
};

/**
 * Create a grid of data cells (no animation information).
 *
 * @param rowNum - Number of rows in the grid.
 * @param colNum - Number of columns in the grid.
 * @param defaultStatus - The status value for the grid.
 * @returns A 2D DataCell grid.
 */
export const initEmptyDataGrid = (
  rowNum: number,
  colNum: number,
  defaultStatus: CellStatusType = CellStatus.DEFAULT
): DataCell[][] => {
  return Array.from({ length: rowNum }, () =>
    Array.from({ length: colNum }, () => ({
      char: "",
      status: defaultStatus,
    }))
  );
};

/**
 * Create a grid of RenderCell (character, status, and animation information).
 *
 * @param rowNum - Number of rows in the grid.
 * @param colNum - Number of columns in the grid.
 * @param defaultStatus- Default cell status.
 * @param defaultAnimation - Default animation type.
 * @param animationDelay - Default animation delay (in seconds).
 * @returns A 2D RenderCell grid.
 */
export const initEmptyRenderGrid = (
  rowNum: number,
  colNum: number,
  defaultStatus: CellStatusType = CellStatus.DEFAULT,
  defaultAnimation: CellAnimationType = CellAnimation.NONE,
  animationDelay = 0
): Array<Array<RenderCell>> => {
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

/**
 * Generates an empty grid of DataCells.
 *
 * @param rows - Number of rows in the grid.
 * @param cols - Number of columns in the grid.
 * @param hidden - If true, cells use HIDDEN status (for answer grid), otherwise DEFAULT.
 * @returns 2D array of RenderCell objects.
 */
export const renderEmptyGrid = (
  rows: number,
  cols: number,
  hidden = false
): RenderCell[][] => {
  const status = hidden ? CellStatus.HIDDEN : CellStatus.DEFAULT;

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      char: "",
      status,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    }))
  );
};
