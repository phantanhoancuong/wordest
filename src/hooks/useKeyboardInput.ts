import { useEffect } from "react";

/**
 * Hook for handling keyboard input and passing it to a callback.
 *
 * Listens for `keydown` events and normalizes single-character keys to uppercase
 * before invoking the provided callback.
 *
 * @param onKeyPress - Callback fired with the pressed key.
 */
export const useKeyboardInput = (onKeyPress: (key: string) => void): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      onKeyPress(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);
};
