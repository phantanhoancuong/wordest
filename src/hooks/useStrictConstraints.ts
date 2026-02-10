import { CellStatus } from "@/lib/constants";
import { CellStatusType } from "@/types/cell";
import { UseStrictConstraintsReturn } from "@/types/useStrictConstraints.types";

import { useActiveSession } from "@/hooks/useActiveSession";

import { countLetter } from "@/lib/utils";

/**
 * Hook to manage Strict constraints and validation logic.
 *
 * This hook tracks accumulated constraints derived from previous guesses:
 * - Locked positions (green letters that must stay in the same position).
 * - Minimum letter counts (letters that must appear at least N times).
 *
 * These constraints persist across guesses within a single game and are enforced before allowing a new guess submission.
 *
 *@param addToast - Function used to display validation error messages.
 */
export const useStrictConstraints = (): UseStrictConstraintsReturn => {
  const {
    lockedPositions,
    setLockedPositions,
    minimumLetterCounts,
    setMinimumLetterCounts,
  } = useActiveSession();

  /**
   * Validates a guess against Strict constraints.
   *
   * @param guess - The guess string to validate.
   * @returns An object with `isValid` and `message`:
   *  - isValid: true if the guess satisfies all Strict constraints.
   *  - message: explanation if invalid, empty string if valid.
   */
  const checkValidStrictGuess = (
    guess: string,
  ): { isValid: boolean; message: string } => {
    // Enforce locked (green) positions.
    for (const [index, letter] of lockedPositions) {
      if (guess[index] !== letter) {
        const message = `${letter} must be in cell ${index + 1}`;
        return { isValid: false, message };
      }
    }

    // Enforce minimum letter counts
    const guessCounts = new Map(Object.entries(countLetter(guess)));
    for (const [letter, minCount] of minimumLetterCounts) {
      if ((guessCounts.get(letter) ?? 0) < minCount) {
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
   * - CORRECT AND PRESENT (green and yellow) letters contribute to minimum letter counts.
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
     * Used to merge with previously accumulated constraints.
     */
    const guessMinCounts = new Map<string, number>();
    const nextLockedPositions = new Map(lockedPositions);
    const nextGuessMinimumLetterCounts = new Map(minimumLetterCounts);

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const letter = guess[i];

      // Lock green letters to their
      if (status === CellStatus.CORRECT) {
        nextLockedPositions.set(i, letter);
      }

      // Count green and yellow letters toward minimum requirements.
      if (status === CellStatus.CORRECT || status === CellStatus.PRESENT) {
        guessMinCounts.set(letter, (guessMinCounts.get(letter) ?? 0) + 1);
      }
    }

    // Merge per-guess counts into global minimum counts.
    for (const [letter, count] of guessMinCounts.entries()) {
      const prev = nextGuessMinimumLetterCounts.get(letter) ?? 0;
      nextGuessMinimumLetterCounts.set(letter, Math.max(prev, count));
    }

    setLockedPositions(nextLockedPositions);
    setMinimumLetterCounts(nextGuessMinimumLetterCounts);
  };

  const resetStrictConstraints = (): void => {
    setLockedPositions(new Map<number, string>());
    setMinimumLetterCounts(new Map<string, number>());
  };

  return {
    checkValidStrictGuess,
    updateStrictConstraints,
    resetStrictConstraints,
  };
};
