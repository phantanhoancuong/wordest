"use client";

import { useRef } from "react";

import { UseAnimationTrackerReturn } from "@/types/useAnimationTracker.types";

/**
 * Tracks active cell animations across multiple rows.
 *
 * - Call `add(num)` whenever you start `num` animations.
 * - Call `markEnd(row, col)` when each animation finishes.
 * - Once all animations have ended (`animatingCount === 0`), the hook automatically calls
 * `flushCallback` with a map of finished cells.
 *
 * @param flushCallback - Called when all animations complete.
 * @param onAllEnd - Optional callback for custom logic after flush.
 */
export const useAnimationTracker = (
  flushCallback: (finishedMap: Record<number, number[]>) => void,
  onAllEnd?: () => void,
): UseAnimationTrackerReturn => {
  const animatingCount = useRef(0);
  const finished = useRef<Record<number, number[]>>({});

  const add = (num: number): void => {
    if (num <= 0) return;
    animatingCount.current += num;
  };

  const markEnd = (row: number, col: number): void => {
    const map = finished.current;

    if (!map[row]) map[row] = [];
    map[row].push(col);

    animatingCount.current -= 1;

    if (animatingCount.current === 0) {
      // Shallow copy so the consumer can’t mutate our internal ref
      flushCallback({ ...map });
      finished.current = {};
      onAllEnd?.();
    }
  };

  const reset = (): void => {
    animatingCount.current = 0;
    finished.current = {};
  };

  const getCount = (): number => {
    return animatingCount.current;
  };

  return { getCount, add, markEnd, reset };
};
