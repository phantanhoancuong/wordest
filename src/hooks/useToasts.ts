import { useState } from "react";

import { MAX_TOASTS } from "@/lib/constants";

import { Toast } from "@/types/toast";
import { UseToastsReturn } from "@/types/useToasts";

/**
 * Hook to manage toast notifications.
 *
 * Handles adding/removing toasts and limits total count to {@link MAX_TOASTS}.
 */
export const useToasts = (): UseToastsReturn => {
  const [toasts, setToasts] = useState<Array<Toast>>([]);

  /** Adds a new toast message. Removes duplicates and trims to {@link MAX_TOASTS}. */
  const addToast = (message: string): void => {
    setToasts((prev) => {
      const withoutDup = prev.filter((t) => t.message !== message);
      const newToast = { id: Date.now(), message };
      return [...withoutDup, newToast].slice(-MAX_TOASTS);
    });
  };

  /** Removes a toast by its ID. */
  const removeToast = (id: number): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toastList: toasts, addToast, removeToast };
};
