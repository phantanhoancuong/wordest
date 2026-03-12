import { CellStatus } from "@/lib/constants";

import { CellStatusType } from "@/types/cell";

import { countLetter } from "@/lib/utils/evaluation";

/**
 * Validate a guess against strict constraints.
 *
 * Enforce two types of constraints accumulated from previous guesses:
 * - Locked positions: Letters marked CORRECT must appear in the same positions.
 * - Minimum letter counts: Letters marked PRESENT or CORRECT must appear at least N times.
 *
 * Used in Strict and Hardcore ruleset to prevent guesses that ignore previously revealed information.
 *
 * @param guess - The guess string to validate.
 * @param lockedPositions - Map of column indices to letters that must stay in those positions.
 * @param minimumLetterCounts - Map of letters to their minimum required counts.
 * @returns Object with 'isValid' boolean and optional violation 'message'.
 */
export const checkValidStrictGuess = (
  guess: string,
  lockedPositions: Record<number, string>,
  minimumLetterCounts: Record<string, number>,
): { isValid: boolean; message: string | null } => {
  // Enforce locked (green) positions.
  for (const index in lockedPositions) {
    const i = Number(index);
    const letter = lockedPositions[i];
    if (guess[i] !== letter) {
      const message = `${letter} must be in cell ${i + 1}`;
      return { isValid: false, message };
    }
  }

  // Enforce minimum letter counts.
  const guessCounts = countLetter(guess);
  for (const letter in minimumLetterCounts) {
    const minCount = minimumLetterCounts[letter];
    if ((guessCounts[letter] ?? 0) < minCount) {
      const message = `Must have at least ${minCount} ${letter}`;
      return { isValid: false, message };
    }
  }

  return { isValid: true, message: null };
};

/**
 * Update strict constraints based on a newly evaluated guess.
 *
 * Process the guess and its evaluated statuses to accumulate new constraints:
 * - Locked positions: Letters marked CORRECT must appear in the same positions.
 * - Minimum letter counts: Letters marked PRESENT or CORRECT must appear at least N times.
 *
 * The function merges new constraints with existing ones, taking the maximum required count for each letter.
 *
 * Called after each valid guess in Strict/Hardcore ruleset to build up the constraints.
 *
 * @param guess - The guess string that was just evaluated.
 * @param statuses - Array of cell statuses (CORRECT, PRESENT, ABSENT) for each letter.
 * @param minimumLetterCounts - Current minimum letter count constraints.
 * @param lockedPositions - Current locked position constraints.
 * @returns Updated 'lockedPositions' and 'minimumLetterCounts' objects.
 */
export const updateStrictConstraints = (
  guess: string,
  statuses: CellStatusType[],
  minimumLetterCounts: Record<string, number>,
  lockedPositions: Record<number, string>,
) => {
  const guessMinCounts: Record<string, number> = {};
  const nextLockedPositions: Record<number, string> = { ...lockedPositions };
  const nextMinimumLetterCounts: Record<string, number> = {
    ...minimumLetterCounts,
  };

  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const letter = guess[i];

    if (status === CellStatus.CORRECT) nextLockedPositions[i] = letter;
    if (status === CellStatus.CORRECT || status === CellStatus.PRESENT)
      guessMinCounts[letter] = (guessMinCounts[letter] ?? 0) + 1;
  }

  for (const letter in guessMinCounts) {
    const prev = nextMinimumLetterCounts[letter] ?? 0;
    nextMinimumLetterCounts[letter] = Math.max(prev, guessMinCounts[letter]);
  }

  return {
    lockedPositions: nextLockedPositions,
    minimumLetterCounts: nextMinimumLetterCounts,
  };
};
