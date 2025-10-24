import { useEffect, useRef } from "react";

/**
 * Hook that returns a ref object always pointing to the latest state value.
 *
 * @template T
 * @param {T} value - The value to keep updated in the ref.
 * @returns {Object} A ref Object with the latest value alwasy in `current`.
 */
export const useLatest = (value) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
