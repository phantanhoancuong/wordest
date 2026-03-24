"use client";

import { useState } from "react";

import { CellStatus } from "@/lib/constants";

import { UseKeyStatusesReturn } from "@/types/useKeyStatuses.types";

/**
 * Manage the visual status (color) of the keyboard keys based on guess feedback.
 *
 * Track each letter's evaluation state (CORRECT, PRESENT, or ABSENT) and ensure the highest priority
 * status is preseved when a letter appears in multiple guesses with different evaluations (CORRECT > PRESENT > ABSENT).
 *
 * Provide hydration from server state, incremental updates after each guess, and reset functionality for new games.
 *
 * @returns Key statuses map, hydration, update, and reset functions.
 */
export const useKeyStatuses = (): UseKeyStatusesReturn => {
  /** Map of letters to their current status (CORRECT, PRESENT, or ABSENT). */
  const [keyStatuses, setKeyStatuses] = useState<Record<string, CellStatus>>(
    {},
  );

  /**
   * Hydrate key statuses from server state after initialization or reload.
   *
   * Scan all previous guesses and build the key status map, preserving the highest priority status for each letter.
   *
   * Used during initialization game to restore keyboard colors.
   *
   * @param guesses - Array of previously submitted guess strings.
   * @param allStatuses - 2D array of cell statuses for each guess.
   */
  const hydrateKeyStatuses = (
    guesses: string[],
    allStatuses: CellStatus[][],
  ): void => {
    const hydratedKeyStatuses = {};
    for (let i = 0; i < guesses.length; ++i) {
      for (let j = 0; j < guesses[i].length; ++j) {
        if (hydratedKeyStatuses[guesses[i][j]] === CellStatus.CORRECT) continue;
        if (
          hydratedKeyStatuses[guesses[i][j]] === CellStatus.PRESENT &&
          allStatuses[i][j] === CellStatus.ABSENT
        )
          continue;

        hydratedKeyStatuses[guesses[i][j]] = allStatuses[i][j];
      }
    }
    setKeyStatuses(hydratedKeyStatuses);
  };
  /**
   * Update the key statuses based on a newly submitted guess.
   *
   * Merge new letter evaluations into the existing status map, preserving the highest priority status when conflicts occur.
   *
   * Called after each guess is evaluated to update keyboard colors.
   *
   * @param guess - The submitted guess string.
   * @param statuses - Array of evaluated cell statuses (CORRECT, PRESENT, or ABSENT).
   */
  const updateKeyStatuses = (guess: string, statuses: CellStatus[]): void => {
    setKeyStatuses((prev) => {
      const next = { ...prev };

      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const newStatus = statuses[i];
        const current = next[letter];

        if (current == CellStatus.CORRECT) continue;
        if (current == CellStatus.PRESENT && newStatus === CellStatus.ABSENT)
          continue;

        next[letter] = newStatus;
      }
      return next;
    });
  };
  /**
   * Reset all key statuses to empty state.
   *
   * Used when starting a new game.
   */
  const resetKeyStatuses = (): void => {
    setKeyStatuses({});
  };

  return {
    keyStatuses,
    hydrateKeyStatuses,
    updateKeyStatuses,
    resetKeyStatuses,
  };
};
