"use client";

import { useEffect, useState } from "react";

/**
 * Loads the stored value when key changes.
 * Falls back to the initial value if parsing fails.
 */
function getLocalStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Hook to persist a state in 'localStorage'.
 *
 * @param key - The 'localStorage' key.
 * @param initialValue - The fallback value when storage is empty or invalid.
 * @returns A tuple containing the stored value and a setter function
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((value: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() =>
    getLocalStorageValue(key, initialValue),
  );

  /**
   * Seed localStorage if empty or invalid.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem(key);
      if (existing === null)
        localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

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
