import { useState } from "react";
import { CellStatus } from "../lib/constants";

/**
 * Hook to manage the visual status of keyboard keys.
 *
 * Tracks each letter's feedback state (`correct`, `present`, or `absent`)
 * and provides utilities to update or reset these states.
 *
 * @returns {{
 *   keyStatuses: Record<string, string>,
 *   updateKeyStatuses: (guess: string, statuses: string[]) => void,
 *   resetKeyStatuses: () => void
 * }}
 */
export const useKeyStatuses = () => {
  const [keyStatuses, setKeyStatuses] = useState({});

  /**
   * Updates key statuses based on the latest guess.
   * Keeps the "strongest" status (e.g., `correct` overrides `present`).
   */
  const updateKeyStatuses = (guess, statuses) => {
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
  const resetKeyStatuses = () => setKeyStatuses({});

  return { keyStatuses, updateKeyStatuses, resetKeyStatuses };
};
