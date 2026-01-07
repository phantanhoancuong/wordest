import { useRef } from "react";

import { countLetter } from "@/lib/utils";

import { CellStatus } from "@/lib/constants";

import { CellStatusType } from "@/types/cell";
import { UseExpertModeConstraintsReturn } from "@/types/useExpertModeConstraints.types";

/**
 * Hook to manage Expert Mode constraints and validation logic.
 *
 * This hook tracks accumulated constraints derived from previous guesses:
 * - Locked positions (green letters that must stay in the same position).
 * - Minimum letter counts (letters that must appear at least N times).
 *
 * These constraints persist across guesses within a single game and are enforced before allowing a new guess submission.
 *
 *@param addToast - Function used to display validation error messages.
 */
export const UseExpertModeConstraints = (
  addToast: (message: string) => void
): UseExpertModeConstraintsReturn => {
  const lockedPositions = useRef<Map<number, string>>(new Map());
  const minimumLetterCounts = useRef<Map<string, number>>(new Map());

  /**
   * Validates a guess against expert-mode constraints.
   *
   * @param guess - The guess string to validate.
   * @returns True if the guess satisfies all expert-mode constraints; otherwise false.
   */
  const checkValidExpertGuess = (guess: string): boolean => {
    // Enforce locked (green) positions.
    for (const [index, letter] of lockedPositions.current) {
      if (guess[index] !== letter) {
        addToast(`Must use ${letter} in position ${index + 1}`);
        return false;
      }
    }

    // Enforce minimum letter counts
    const guessCounts = new Map(Object.entries(countLetter(guess)));
    for (const [letter, minCount] of minimumLetterCounts.current) {
      if ((guessCounts.get(letter) ?? 0) < minCount) {
        addToast(`Guess must use ${letter}`);
        return false;
      }
    }
    return true;
  };

  /**
   * Updates Expert Mode constraints based on the result of the submitted guess.
   *
   * Rules:
   * - CORRECT (green) letters lock the letter to its exact position.
   * - CORRECT AND PRESENT (green and yellow) letters contribute to minimum letter counts.
   *
   * @param guess - The submitted guess string.
   * @param statuses - Cell evoluation results corresponding to the guess.
   */
  const updateExpertConstraints = (
    guess: string,
    statuses: CellStatusType[]
  ): void => {
    /**
     * Tracks minimum letter counts contributed by this specific guess.
     * Used to merge with previously accumulated constraints.
     */
    const guessMinCounts = new Map<string, number>();

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const letter = guess[i];

      // Lock green letters to their
      if (status === CellStatus.CORRECT) {
        lockedPositions.current.set(i, letter);
      }

      // Count green and yellow letters toward minimum requirements.
      if (status === CellStatus.CORRECT || status === CellStatus.PRESENT) {
        guessMinCounts.set(letter, (guessMinCounts.get(letter) ?? 0) + 1);
      }

      // Merge per-guess counts into global minimum counts.
      for (const [letter, count] of guessMinCounts.entries()) {
        const prev = minimumLetterCounts.current.get(letter) ?? 0;
        minimumLetterCounts.current.set(letter, Math.max(prev, count));
      }
    }
  };

  return { checkValidExpertGuess, updateExpertConstraints };
};
