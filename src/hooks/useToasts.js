import { useState } from "react";
import { MAX_TOASTS } from "../lib/constants";

/**
 * @typedef {Object} Toast
 * @property {number} id - Unique toast ID.
 * @property {string} message - Toast message content.
 */

/**
 * Hook to manage toast notifications.
 *
 * Handles adding/removing toasts and limits total count to {@link MAX_TOASTS}.
 *
 * @returns {{ toastList: Toast[], addToast: (message: string) => void, removeToast: (id: number) => void }}
 */
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  /** Adds a new toast message. Removes duplicates and trims to {@link MAX_TOASTS}. */
  const addToast = (message) => {
    setToasts((prev) => {
      const withoutDup = prev.filter((t) => t.message !== message);
      const newToast = { id: Date.now(), message };
      return [...withoutDup, newToast].slice(-MAX_TOASTS);
    });
  };

  /** Removes a toast by its ID. */
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toastList: toasts, addToast, removeToast };
};
