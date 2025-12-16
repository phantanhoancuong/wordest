import { useEffect, useState } from "react";

/**
 * Hook to persist a state in 'localStorage'.
 *
 * @param key - The 'localStorage' key.
 * @param initialValue - The fallback value when storage is empty or invalid.
 * @returns A tuple containing the stored value and a setter function
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((value: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  /**
   * Loads the stored value when key changes.
   * Falls back to the initial value if parsing fails.
   */
  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item === null) {
      setStoredValue(initialValue);
      return;
    }

    try {
      setStoredValue(JSON.parse(item));
    } catch {
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  /**
   * Updates state and syncs the value to 'localStorage'.
   */
  const setValue = (value: T | ((value: T) => T)) => {
    setStoredValue((prevValue) => {
      const nextValue =
        typeof value === "function"
          ? (value as (prev: T) => T)(prevValue)
          : value;
      localStorage.setItem(key, JSON.stringify(nextValue));
      return nextValue;
    });
  };

  return [storedValue, setValue];
};
