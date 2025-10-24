import { useState } from "react";
import { CellStatus } from "../lib/constants";

/**
 * Hook to manage statuses of keys on the keyboard (feedback for guesses)
 *
 * Tracks whether each letter has been guessed correctly, is present in the word, or absent
 *
 * Provides functions to update statuses based on guesses and reset them
 *
 * @returns {Object} Keyboard statuses state utilities
 * @property {Object} keyStatuses - Mapping from letters to their CellStatus
 * @property {Function} updateKeyStatuses - Updates statuses based on a new guess
 * @property {Function} resetKeyStatuses - Resets all key statuses to empty
 */
export const useKeyStatuses = () => {
  const [keyStatuses, setKeyStatuses] = useState({});

  /**
   * Updates the status of each key based on the latest guess
   *
   * Only upgrades the status if the new status is "better"
   *
   * @param {string} guess - The guessed word (all caps)
   * @param {Array<string>} statuses - Array of statuses for each letter in all previous guesses
   * @returns {void}
   */
  const updateKeyStatuses = (guess, statuses) => {
    setKeyStatuses((prev) => {
      const newStatuses = { ...prev };
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const newStatus = statuses[i];
        const currentStatus = newStatuses[letter];

        if (currentStatus === CellStatus.CORRECT) continue;
        if (
          currentStatus === CellStatus.PRESENT &&
          newStatus === CellStatus.ABSENT
        )
          continue;
        newStatuses[letter] = newStatus;
      }
      return newStatuses;
    });
  };

  /**
   * Resets all key statuses to their initial empty state
   *
   * @returns {void}
   */
  const resetKeyStatuses = () => {
    setKeyStatuses({});
  };

  return { keyStatuses, updateKeyStatuses, resetKeyStatuses };
};
