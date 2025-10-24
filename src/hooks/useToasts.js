import { useState } from "react";
import { MAX_TOASTS } from "../lib/constants";

/**
 * Hook to manage toast notifications.
 *
 * Allows adding and removing toasts while limiting thetotal number displayed at once.
 *
 * @returns {Object} Toast state utilities
 * @property {Array<Object>} toasts - Array of current toast objects
 * @property {Function} addToast - Adds a new toast message.
 * @property {Function} removeToast - Removes a toast by ID.
 */
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a new toast message to the list.
   *
   * If a toast with the same message already exists, it is removed first.
   * Ensures the total number of toasts does not exceed MAX_TOASTS.
   *
   * @param {string} message - The message to display in the toast.
   * @returns {void}
   */
  const addToast = (message) => {
    setToasts((prev) => {
      const without = prev.filter((t) => t.message !== message);
      const newToast = { id: Date.now(), message };
      const updated = [...without, newToast];
      return updated.slice(-MAX_TOASTS);
    });
  };

  /**
   * Removes a toast by its ID.
   *
   * @param {number} id - The ID of the toast to remove.
   * @returns {void}
   */
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};
