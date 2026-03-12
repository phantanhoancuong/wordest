"use client";

import { UseStrictConstraintsReturn } from "@/types/useStrictConstraints.types";

import { useActiveSession } from "@/hooks";

/**
 * Hook that manages Strict and Hardcore ruleset constraints tracking and validation.
 *
 * Track constraints accumulated from previous guesses.
 * - Locked positions: Letters marked CORRECT that must remain in their position.
 * - Minimum letter counts: Letters marked PRESENT that must appear at least N times.
 *
 * These constraints persist across guesses within a single game session
 * and are enforced before allowing a new guess to be submitted in Strict/Hardcore rulesets.
 *
 * Constraints are synced with server state after each valid guess and reset on game restart.
 *
 * @returns Functions to sync and reset strict constraints.
 */
export const useStrictConstraints = (): UseStrictConstraintsReturn => {
  const { setLockedPositions, setMinimumLetterCounts } = useActiveSession();

  /**
   * Sync strict constraints from server state after a guess is evaluated.
   *
   * Update the local constraint tracking with the latest locked positions
   * and minimum letter counts returned from the server after guess validation.
   *
   * @param lockedPositions - Map of column indices to letters that must stay in those positions.
   * @param minimumLetterCounts - Map of letters to their minimum required counts.
   */
  const syncStrictConstraints = (
    lockedPositions: Record<number, string>,
    minimumLetterCounts: Record<string, number>,
  ): void => {
    setLockedPositions(lockedPositions);
    setMinimumLetterCounts(minimumLetterCounts);
  };

  /**
   * Reset all Strict constraints for the current session.
   *
   * Clear both locked positions and minimum letter counts.
   * Called when starting a new game.
   */
  const resetStrictConstraints = (): void => {
    setLockedPositions({});
    setMinimumLetterCounts({});
  };

  return {
    syncStrictConstraints,
    resetStrictConstraints,
  };
};
