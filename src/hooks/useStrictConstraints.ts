import { CellStatus } from "@/lib/constants";
import { CellStatusType } from "@/types/cell";
import { UseStrictConstraintsReturn } from "@/types/useStrictConstraints.types";

import { useActiveSession } from "@/hooks";

import { countLetter } from "@/lib/utils";

/**
 * Hook for managing Strict and Hardcore constraints and validation logic.
 *
 * This hook tracks constraints accumulated from previous guesses:
 * - Locked positions: green letters that must stay in the same positions.
 * - Minimum letter counts: letters that must appear at least N times due to them being revealed as present.
 *
 * These constraints persist across guesses within a single game session
 * and are enforced before allowing a new guess to be submitted.
 */
export const useStrictConstraints = (): UseStrictConstraintsReturn => {
  const {
    lockedPositions,
    setLockedPositions,
    minimumLetterCounts,
    setMinimumLetterCounts,
  } = useActiveSession();

  /**
   * Validates a guess against the current Strict constraints.
   *
   * @param guess - The guess string to validate.
   * @returns An object with:
   *  - isValid: true if the guess satisfies all Strict constraints.
   *  - message: explanation if invalid, empty string if valid.
   */
  const checkValidStrictGuess = (
    guess: string,
  ): { isValid: boolean; message: string } => {
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

    return { isValid: true, message: "" };
  };

  /**
   * Updates Strict constraints based on the result of the submitted guess.
   *a
   * Rules:
   * - CORRECT (green) letters lock the letter to its exact position.
   * - CORRECT and PRESENT (green and yellow) letters contribute to minimum letter counts.
   *
   * @param guess - The submitted guess string.
   * @param statuses - Cell evoluation results corresponding to the guess.
   */
  const updateStrictConstraints = (
    guess: string,
    statuses: CellStatusType[],
  ): void => {
    /**
     * Tracks minimum letter counts contributed by this specific guess.
     * These values are merged into the accumulated constraints.
     */
    const guessMinCounts: Record<string, number> = {};
    const nextLockedPositions: Record<number, string> = { ...lockedPositions };
    const nextMinimumLetterCounts: Record<string, number> = {
      ...minimumLetterCounts,
    };

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const letter = guess[i];

      // Lock green letters to their positions.
      if (status === CellStatus.CORRECT) {
        nextLockedPositions[i] = letter;
      }

      // Count green and yellow letters toward minimum requirements.
      if (status === CellStatus.CORRECT || status === CellStatus.PRESENT) {
        guessMinCounts[letter] = (guessMinCounts[letter] ?? 0) + 1;
      }
    }

    // Merge per-guess minimum counts into the accumulated constraints.
    for (const letter in guessMinCounts) {
      const prev = nextMinimumLetterCounts[letter] ?? 0;
      nextMinimumLetterCounts[letter] = Math.max(prev, guessMinCounts[letter]);
    }

    setLockedPositions(nextLockedPositions);
    setMinimumLetterCounts(nextMinimumLetterCounts);
  };

  /**
   * Reset all Strict constraints for the current session.
   */
  const resetStrictConstraints = (): void => {
    setLockedPositions({});
    setMinimumLetterCounts({});
  };

  return {
    checkValidStrictGuess,
    updateStrictConstraints,
    resetStrictConstraints,
  };
};
