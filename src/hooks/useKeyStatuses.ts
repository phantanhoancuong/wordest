"use client";

import { CellStatus } from "@/lib/constants";

import { CellStatusType } from "@/types/cell";
import { UseKeyStatusesReturn } from "@/types/useKeyStatuses.types";

import { useActiveSession } from "@/hooks";

/**
 * Hook to manage the visual status of keyboard keys.
 *
 * Tracks each letter's feedback state (`correct`, `present`, or `absent`)
 * and provides utilities to update or reset these states.
 */
export const useKeyStatuses = (): UseKeyStatusesReturn => {
  const { keyStatuses, setKeyStatuses, resetKeyStatuses } = useActiveSession();

  /**
   * Updates key statuses based on the latest guess.
   * Keeps the "strongest" status (e.g., `correct` overrides `present`).
   */
  const updateKeyStatuses = (
    guess: string,
    statuses: CellStatusType[],
  ): void => {
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

  return { keyStatuses, updateKeyStatuses, resetKeyStatuses };
};
