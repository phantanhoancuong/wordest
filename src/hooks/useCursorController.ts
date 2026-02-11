import { useRef } from "react";

import { useActiveSession, useLatest } from "@/hooks";

import { UseCursorControllerReturn } from "@/types/useCursorController.types";

/**
 * Hook to manage cursor state.
 *
 * Tracks the current index of where the user is typing to guide grid rendering, animation, and game logic.
 */
export const useCursorController = (): UseCursorControllerReturn => {
  const {
    row: rowState,
    col: colState,
    setRow: setRowState,
    setCol: setColState,
    incrementRow: incrementRowState,
  } = useActiveSession();

  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);
  const pendingRowAdvance = useRef(false);

  /**
   * Cancels any pending row advancement in the cursor.
   *
   * Used when an invalid guess prevents the row from advancing.
   */
  const cancelPendingRowAdvance = () => {
    pendingRowAdvance.current = false;
  };

  /**
   * Resets the cursor index to its initial position.
   */
  const resetCursor = (): void => {
    setRowState(0);
    setColState(0);
    pendingRowAdvance.current = false;
  };

  /**
   * Advances the cursor to the next row and resets the column index to 0.
   */
  const advanceRow = (): void => {
    pendingRowAdvance.current = false;
    setColState(0);
    incrementRowState();
  };

  /**
   * Advances the cursor to the next column, if not at the column limit.
   *
   * @param colLimit - The maximum number of columns in the row.
   * @returns The current column index before advancing, or null if at limit.
   */
  const advanceCol = (colLimit: number): number | null => {
    if (colRef.current >= colLimit) return null;
    const currentCol = colRef.current;
    setColState(currentCol + 1);
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
    setColState(newCol);
    return newCol;
  };

  /**
   * Queue a row advancement to be committed later (for animation syncing purposes).
   * Called after a valid guess to move the cursor to the next row.
   */
  const queueRowAdvance = (): void => {
    pendingRowAdvance.current = true;
  };

  /**
   * Commits a previously queued row advancement.
   * Does nothing if no advance is queued.
   */
  const commitPendingRowAdvance = (): void => {
    if (pendingRowAdvance.current) advanceRow();
  };

  return {
    row: rowRef,
    col: colRef,
    pendingRowAdvance,
    advanceRow,
    advanceCol,
    retreatCol,
    queueRowAdvance,
    commitPendingRowAdvance,
    resetCursor,
    cancelPendingRowAdvance,
  };
};
