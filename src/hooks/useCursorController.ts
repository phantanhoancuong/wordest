"use client";
import { useRef } from "react";

import { UseCursorControllerReturn } from "@/types/useCursorController.types";

/**
 * Hook to manage cursor state.
 *
 * Tracks the current index of where the user is typing to guide grid rendering, animation, and game logic.
 */
export const useCursorController = (
  row: number,
  col: number,
): UseCursorControllerReturn => {
  const rowNum = useRef<number>(row);
  const colNum = useRef<number>(col);
  const rowRef = useRef<number>(0);
  const colRef = useRef<number>(0);

  const hydrateCursor = (rowIndex: number = 0): void => {
    rowRef.current = rowIndex;
    colRef.current = 0;
  };
  /**
   * Resets the cursor index to its initial position.
   */
  const resetCursor = (): void => {
    rowRef.current = 0;
    colRef.current = 0;
  };

  /**
   * Advances the cursor to the next row and resets the column index to 0.
   */
  const advanceRow = (rowLimit: number = rowNum.current): number | null => {
    if (rowRef.current >= rowLimit) return null;
    const currentRow = rowRef.current;
    rowRef.current = rowRef.current + 1;
    colRef.current = 0;
    return currentRow;
  };

  /**
   * Advances the cursor to the next column, if not at the column limit.
   *
   * @param colLimit - The maximum number of columns in the row.
   * @returns The current column index before advancing, or null if at limit.
   */
  const advanceCol = (colLimit: number = colNum.current): number | null => {
    if (colRef.current >= colLimit) return null;
    const currentCol = colRef.current;
    colRef.current = colRef.current + 1;
    return currentCol;
  };

  /**
   * Moves the cursor back one column, if not at the first column.
   *
   * @returns The new column index after retreating, or null if at column 0.
   */
  const retreatCol = (): number | null => {
    if (colRef.current === 0) return null;
    const newCol = colRef.current - 1;
    colRef.current = newCol;
    return newCol;
  };

  return {
    row: rowRef,
    col: colRef,
    hydrateCursor,
    resetCursor,
    advanceRow,
    advanceCol,
    retreatCol,
  };
};
