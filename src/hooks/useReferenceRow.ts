import { useRef, useState } from "react";

import { CellAnimation, CellStatus, WordLength } from "@/lib/constants";

import { RenderCell } from "@/types/cell";
import { useReferenceRowReturn } from "@/types/useReferenceRow.types";

import { useLatest } from "./useLatest";

import { initEmptyRenderRow } from "@/lib/utils";

/**
 * Manage the reference row state, displaying correctly guessed letters.
 *
 * The reference row is a single-row grid that accomulates CORRECT letters from all previous guesses,
 * showing the player which letters they've placed correctly.
 * Also display the final answer (all letters) after game completion with bounce animations.
 *
 * The row automatically resets when the column count (word length) changes.
 *
 * @param col - Number of column (word length) in the reference row.
 * @param status - Default cell status for new/reset cells.
 * @param animation - Default animation state for cells.
 * @param animationDelay - Default animation delay in milliseconds.
 *
 * @returns Reference row state, dimensions, and methods for updates, animations, and hydration.
 */
export const useReferenceRow = (
  col: number,
  status: CellStatus = CellStatus.DEFAULT,
  animation: CellAnimation = CellAnimation.NONE,
  animationDelay: number = 0,
): useReferenceRowReturn => {
  /** Current number of columns (word length). */
  const [colNum, setColNum] = useState<number>(col);

  const defaultStatus = useRef(status);
  const defaultAnimation = useRef(animation);
  const defaultAnimationDelay = useRef(animationDelay);

  const [row, setRow] = useState<RenderCell[]>(
    initEmptyRenderRow(
      colNum,
      defaultStatus.current,
      defaultAnimation.current,
      defaultAnimationDelay.current,
    ),
  );
  const rowRef = useLatest(row);

  /** Track whether animations are currently running to prevent conflicts. */
  const isAnimating = useRef<boolean>(false);

  const prevColNumRef = useRef<number>(col);
  /** Reset row when word length changes. */
  if (prevColNumRef.current !== col) {
    prevColNumRef.current = col;
    setColNum(col);
    setRow(
      initEmptyRenderRow(
        col,
        defaultStatus.current,
        defaultAnimation.current,
        defaultAnimationDelay.current,
      ),
    );
  }

  /**
   * Hydrate the reference row from server state after initialization or reload.
   *
   * Scan all previous guesses and populate the reference row with any letters that were marked CORRECT.
   * Once a position shows CORRECT, it won't be overwritten by later guesses.
   *
   * Used during game initialization to restore the reference row's accumulated statuses.
   *
   * @param guesses - Array of previously submitted guess strings.
   * @param allStatuses - 2D array of cell statuses for each guess.
   * @param wordLength - Length of each word (column count).
   */
  const hydrateRow = (
    guesses: string[],
    allStatuses: CellStatus[][],
    wordLength: WordLength,
  ) => {
    const hydratedRow = initEmptyRenderRow(
      colNum,
      defaultStatus.current,
      defaultAnimation.current,
      defaultAnimationDelay.current,
    );
    for (let i = 0; i < guesses.length; ++i) {
      for (let j = 0; j < wordLength; ++j) {
        if (hydratedRow[j].status === CellStatus.CORRECT) continue;
        if (allStatuses[i][j] === CellStatus.CORRECT) {
          hydratedRow[j].status = CellStatus.CORRECT;
          hydratedRow[j].char = guesses[i][j];
        }
      }
    }
    setRow(hydratedRow);
  };

  /**
   * Update the reference row with partial cell data.
   *
   * Merge provided cell properties with defaults for each position.
   * Primarily used when updating CORRECT letters from guess evaluation.
   *
   * @param newRow - Array of partial cell properties to merge.
   */
  const updateRow = (newRow: Partial<RenderCell>[]): void => {
    setRow(
      newRow.map((cell) => ({
        char: "",
        status: defaultStatus.current,
        animation: defaultAnimation.current,
        animationDelay: defaultAnimationDelay.current,
        ...cell,
      })),
    );
  };
  /**
   * Reset the reference row to its initial empty state.
   *
   * Clear all characters and statuses. Used when restarting a game.
   */
  const resetRow = (): void => {
    setRow(
      initEmptyRenderRow(
        colNum,
        defaultStatus.current,
        defaultAnimation.current,
        defaultAnimationDelay.current,
      ),
    );
  };

  /**
   * Apply animations to the reference row.
   *
   * Replace the entire row with a new row state, with animations attached.
   * Used when revealing the answer after game completion.
   * Lock the row during animation.
   *
   * @param newRow - New array of cells with animation properties set.
   */
  const applyRowAnimation = (newRow: RenderCell[]): void => {
    isAnimating.current = true;
    setRow(newRow);
  };
  /**
   * Clear animation from finished cells after animation completion.
   *
   * Reset animation properties to default state for cells that have completed their animations.
   *
   * The reference row is always treated as row index 0 in the finishedMap.
   *
   * @param finishedMap - Map of row indices to arrays of finished column indices.
   */
  const flushAnimation = (finishedMap: Record<number, number[]>) => {
    isAnimating.current = false;
    setRow((prevRow) => {
      const finishedCols = finishedMap[0];
      if (!finishedCols) return prevRow;

      return prevRow.map((cell, colIndex) => {
        if (!finishedCols.includes(colIndex)) return cell;

        return {
          ...cell,
          animation: defaultAnimation.current,
          animationDelay: defaultAnimationDelay.current,
        };
      });
    });
  };

  return {
    colNum,
    row,
    rowRef,
    hydrateRow,
    updateRow,
    resetRow,
    applyRowAnimation,
    flushAnimation,
  };
};
