import { useEffect, useRef } from "react";

/**
 * Hook that returns a ref always pointing to the latest value.
 *
 * @template T
 * @param {T} value - The value to keep updated in the ref.
 * @returns {import('react').MutableRefObject<T>} Ref object with the latest value in `current`.
 */
export const useLatest = (value) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
