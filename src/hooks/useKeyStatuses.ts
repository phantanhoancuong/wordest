import { useState } from "react";
import { CellStatusType } from "../types/cell";
import { CellStatus } from "../lib/constants";
import { UseKeyStatusesReturn } from "../types/useKeyStatuses.types";

/**
 * Hook to manage the visual status of keyboard keys.
 *
 * Tracks each letter's feedback state (`correct`, `present`, or `absent`)
 * and provides utilities to update or reset these states.
 */
export const useKeyStatuses = (): UseKeyStatusesReturn => {
  const [keyStatuses, setKeyStatuses] = useState<
    Partial<Record<string, CellStatusType>>
  >({});

  /**
   * Updates key statuses based on the latest guess.
   * Keeps the "strongest" status (e.g., `correct` overrides `present`).
   */
  const updateKeyStatuses = (
    guess: string,
    statuses: Array<CellStatusType>
  ): void => {
    setKeyStatuses((prev) => {
      const next = { ...prev };
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const newStatus = statuses[i];
        const current = next[letter];

        if (current === CellStatus.CORRECT) continue;
        if (current === CellStatus.PRESENT && newStatus === CellStatus.ABSENT)
          continue;

        next[letter] = newStatus;
      }
      return next;
    });
  };

  /** Resets all key statuses to their initial empty state. */
  const resetKeyStatuses = (): void => setKeyStatuses({});

  return { keyStatuses, updateKeyStatuses, resetKeyStatuses };
};
