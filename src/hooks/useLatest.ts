"use client";

import { useEffect, useRef, RefObject } from "react";

/**
 * Hook that returns a ref always pointing to the latest value.
 *
 * @param value - The value to keep updated in the ref.
 * @returns Ref object with the latest value in `current`.
 */
export const useLatest = <T>(value: T): RefObject<T> => {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
