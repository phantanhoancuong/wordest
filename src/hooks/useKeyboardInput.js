import { useEffect } from "react";

/**
 * Hook for handling keyboard input and passing it to a callback.
 *
 * Listens for `keydown` events and normalizes single-character keys to uppercase
 * before invoking the provided callback.
 *
 * @param {(key: string) => void} onKeyPress - Callback fired with the pressed key.
 */
export const useKeyboardInput = (onKeyPress) => {
  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const handleKeyDown = (e) => {
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      onKeyPress(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);
};
