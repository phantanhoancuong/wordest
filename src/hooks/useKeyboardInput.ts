import { useEffect } from "react";

/**
 * Hook for handling keyboard input and passing it to a callback.
 *
 * Listens for `keydown` events and normalizes single-character keys to uppercase
 * before invoking the provided callback.
 *
 * Held down keys are ignored to prevent repeated inputs.
 *
 * @param onKeyPress - Callback fired with the pressed key.
 */
export const useKeyboardInput = (
  onKeyPress: (key: string, event: KeyboardEvent) => void
): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      onKeyPress(key, e);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);
};
