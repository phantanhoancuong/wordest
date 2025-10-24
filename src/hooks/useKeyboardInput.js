import { useEffect } from "react";

/**
 * Hook to handle keyboard input and pass it to a callback.
 *
 * Listens for keydown events and normalizes single-character keys to uppercase.
 * Calls the provided callback with the pressed key.
 *
 * @param {Function} onKeyPress - Callback function invoked with the key that was pressed.
 *
 * @returns {void}
 */
export const useKeyboardInput = (onKeyPress) => {
  useEffect(() => {
    /**
     * Handles the keydown event.
     *
     * Normalizes single-character keys to uppercase before invoking the callback.
     *
     * @param {KeyboardEvent} event - The keydown event object
     */
    const handleKeyDown = (event) => {
      const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
      onKeyPress(key);
    };

    // Attach keydown listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on unmount or dependency change
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);
};
