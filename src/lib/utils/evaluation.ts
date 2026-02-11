import { CellStatus } from "@/lib/constants";

import { CellStatusType } from "@/types/cell";

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
  targetLetterCount: Record<string, number>,
): Array<CellStatusType> => {
  const wordLength = guess.length;
  const tempLetterCount = { ...targetLetterCount };
  const statuses = Array(wordLength).fill(CellStatus.ABSENT);

  for (let i = 0; i < wordLength; i++) {
    if (guess[i] === targetWord[i]) {
      statuses[i] = CellStatus.CORRECT;
      tempLetterCount[guess[i]] -= 1;
    }
  }

  for (let i = 0; i < wordLength; i++) {
    if (statuses[i] === CellStatus.CORRECT) continue;
    if (tempLetterCount[guess[i]] > 0) {
      statuses[i] = CellStatus.PRESENT;
      tempLetterCount[guess[i]] -= 1;
    }
  }

  return statuses;
};
