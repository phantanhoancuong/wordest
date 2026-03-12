import { useRef, useState } from "react";

import {
  animationTiming,
  CellAnimation,
  CellStatus,
  WordLength,
} from "@/lib/constants";

import { RenderCell } from "@/types/cell";
import { useGameGridReturn } from "@/types/useGameGrid.types";

import { useLatest } from "@/hooks/useLatest";

import { initEmptyRenderGrid } from "@/lib/utils";

/**
 * Manage the main game grid state, animations, and updates.
 *
 * Responsibilities:
 * - Maintain a 2D grid of cells with support for character input, status changes,
 * and animations (bounce, shake).
 * - Handle hydration from server state, individual cell updates, row-level animation application,
 * and animation cleanup after completion.
 *
 * The grid automatically resets when the column count (word length) changes.
 *
 * @param row - Number of rows (attempts) in the grid.
 * @param col - Number of columns (word length) in the grid.
 * @param status - Default cell status for new/reset cells.
 * @param animation - Default animation state for cells.
 * @param animationDelay - Default animation delay in milliseconds.
 * @returns Grid state, dimensions, and methods for updates, animations, and hydration.
 */
export const useGameGrid = (
  row: number,
  col: number,
  status: CellStatus = CellStatus.DEFAULT,
  animation: CellAnimation = CellAnimation.NONE,
  animationDelay: number = 0,
): useGameGridReturn => {
  /** Fixed number of rows (attempts allowed). */
  const rowNum = useRef<number>(row);

  /** Current number of columns (word length). */
  const [colNum, setColNum] = useState<number>(col);

  const defaultStatus = useRef(status);
  const defaultAnimation = useRef(animation);
  const defaultAnimationDelay = useRef(animationDelay);

  const [grid, setGrid] = useState<RenderCell[][]>(
    initEmptyRenderGrid(
      rowNum.current,
      colNum,
      defaultStatus.current,
      defaultAnimation.current,
      defaultAnimationDelay.current,
    ),
  );
  const gridRef = useLatest(grid);

  /** Track whether animations are currently running to prevent input conflicts. */
  const isAnimating = useRef<boolean>(false);

  const prevColNumRef = useRef<number>(col);

  /** Reset grid when word length changes. */
  if (prevColNumRef.current !== col) {
    prevColNumRef.current = col;
    setColNum(col);
    setGrid(
      initEmptyRenderGrid(
        rowNum.current,
        col,
        defaultStatus.current,
        defaultAnimation.current,
        defaultAnimationDelay.current,
      ),
    );
  }

  /**
   * Hydrate the grid from server state after initialization or page reload.
   *
   * Populate previous guesses and their evaluated statuses into the grid.
   * Used during game initialization to restore progress.
   *
   * @param guesses - Array of previously submitted guess strings.
   * @param allStatuses - 2D array of cell statuses for each guess.
   * @param wordLength - Length of each word (column count).
   */
  const hydrateGrid = (
    guesses: string[],
    allStatuses: CellStatus[][],
    wordLength: WordLength,
  ): void => {
    const hydratedGrid = initEmptyRenderGrid(
      rowNum.current,
      colNum,
      defaultStatus.current,
      defaultAnimation.current,
      defaultAnimationDelay.current,
    );
    for (let i = 0; i < guesses.length; ++i) {
      for (let j = 0; j < wordLength; ++j) {
        hydratedGrid[i][j].char = guesses[i][j];
        hydratedGrid[i][j].status = allStatuses[i][j];
      }
    }

    setGrid(hydratedGrid);
  };

  /**
   * Replace an entire row in the grid with a new row state.
   *
   * Used internally by animation and update methods to commit changes.
   *
   * @param rowIndex - Index of the row to update.
   * @param newRow  - New array of cells to replace the row with.
   */
  const updateRow = (rowIndex: number, newRow: RenderCell[]): void => {
    const newGrid = [...gridRef.current];
    newGrid[rowIndex] = newRow;
    setGrid(newGrid);
  };
  /**
   * Update a single cell in the grid.
   *
   * Merge provided cell properties with default.
   * Used for character input and backspace operations.
   *
   * @param rowIndex - Row index of the cell to update.
   * @param colIndex - Column index of the cell to update.
   * @param newCell - Partial cell properties to merge.
   */
  const updateCell = (
    rowIndex: number,
    colIndex: number,
    newCell: Partial<RenderCell> = {},
  ) => {
    const newRow = [...gridRef.current[rowIndex]];
    newRow[colIndex] = {
      char: "",
      status: defaultStatus.current,
      animation: defaultAnimation.current,
      animationDelay: defaultAnimationDelay.current,
      ...newCell,
    };
    updateRow(rowIndex, newRow);
  };

  /**
   * Apply shake animation to a row after an invalid guess submission.
   *
   * All cells in the row shake simultaneously to indicate the guess was rejected.
   * Lock the grid during animation to prevent input.
   *
   * @param rowIndex - Index of the row to animate.
   */
  const applyInvalidGuessAnimation = (rowIndex: number): void => {
    isAnimating.current = true;
    const newRow = gridRef.current[rowIndex].map((cell: RenderCell) => ({
      ...cell,
      animation: CellAnimation.SHAKE,
      animationDelay: 0,
    }));
    updateRow(rowIndex, newRow);
  };
  /**
   * Apply bounce animations to a row after a valid guess submission.
   *
   * Set each cell's status and apply staggered bounce animatins.
   * Lock the grid during animation to prevent input.
   *
   * @param rowIndex - Index of the row to animate.
   * @param statuses - Array of evaluated cell statuses.
   * @param animationSpeedMultiplier - Spped multiplier for animation timing.
   */
  const applyValidGuessAnimation = (
    rowIndex: number,
    statuses: CellStatus[],
    animationSpeedMultiplier: number,
  ) => {
    isAnimating.current = true;
    const newRow = gridRef.current[rowIndex].map(
      (cell: RenderCell, index: number) => ({
        ...cell,
        status: statuses[index],
        animation: CellAnimation.BOUNCE,
        animationDelay:
          index * animationTiming.bounce.delay * animationSpeedMultiplier,
      }),
    );
    updateRow(rowIndex, newRow);
  };

  /**
   * Reset the entire grid to its initial empty state.
   *
   * Clear all characters and statuses. Used when restarting a game.
   */
  const resetGrid = (): void => {
    setGrid(
      initEmptyRenderGrid(
        rowNum.current,
        colNum,
        defaultStatus.current,
        defaultAnimation.current,
        defaultAnimationDelay.current,
      ),
    );
  };

  /**
   * Clear animations from finished cells after animation completion.
   *
   * Reset animation properties to default state for cells that have completed their animations.
   * Unlock the grid for input.
   *
   * @param finishedMap - Map of row indices to arrays of finished column indices.
   */
  const flushAnimation = (finishedMap: Record<number, number[]>) => {
    isAnimating.current = false;
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row, rowIndex) => {
        const finishedCols = finishedMap[rowIndex];
        if (!finishedCols) return row;

        return row.map((cell, colIndex) => {
          if (!finishedCols.includes(colIndex)) return cell;

          return {
            ...cell,
            animation: defaultAnimation.current,
            animationDelay: defaultAnimationDelay.current,
          };
        });
      });
      return newGrid;
    });
  };

  return {
    rowNum: rowNum.current,
    colNum: colNum,
    grid,
    gridRef,
    hydrateGrid,
    updateCell,
    applyInvalidGuessAnimation,
    applyValidGuessAnimation,
    resetGrid,
    flushAnimation,
  };
};
