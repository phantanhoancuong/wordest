import { useRef, useState } from "react";

import { CellStatus, CellAnimation } from "../lib/constants";
import { initEmptyGrid } from "../lib/utils";

import { useLatest } from "./useLatest";
import { Cell, PartialCell } from "../types/cell";
import { UseGridStateReturn } from "../types/useGridState.types";

/**
 * Manages a 2D grid of cells representing player's guesses.
 *
 * Provides utilities to update individual cells or rows, reset the grid,
 * and clear animations after they finish.
 *
 * @param row - Number of rows.
 * @param col - Number of columns.
 * @param status - Default cell status. Defaults to `CellStatus.DEFAULT`.
 * @param animation - Default cell animation. Defaults to `CellAnimation.NONE`.
 * @param animationDelay - Default animation delay (seconds). Defaults to 0.
 * @returns Grid state and utility functions:
 *   - `grid` - 2D array of cells.
 *   - `gridRef` - Ref always pointing to the latest grid.
 *   - `rowNum`, `colNum` - Dimensions.
 *   - `updateCell`, `updateRow`, `flushAnimation`, `resetGrid` - Utility methods.
 */
export const useGridState = (
  row: number,
  col: number,
  status: CellStatus = CellStatus.DEFAULT,
  animation: CellAnimation = CellAnimation.NONE,
  animationDelay: number = 0
): UseGridStateReturn => {
  const rowNum = useRef(row);
  const colNum = useRef(col);
  const defaultStatus = useRef(status);
  const defaultAnimation = useRef(animation);
  const defaultAnimationDelay = useRef(animationDelay);

  const [grid, setGrid] = useState(
    initEmptyGrid(
      rowNum.current,
      colNum.current,
      defaultStatus.current,
      defaultAnimation.current,
      defaultAnimationDelay.current
    )
  );
  const gridRef = useLatest(grid);

  /**
   * Resets the grid to its initial empty state.
   */
  const resetGrid = () => {
    setGrid(
      initEmptyGrid(
        rowNum.current,
        colNum.current,
        defaultStatus.current,
        defaultAnimation.current,
        defaultAnimationDelay.current
      )
    );
  };

  /**
   * Replaces an entire row in the grid with a new row array.
   *
   * @param rowIndex - Index of the row to replace.
   * @param newRow - The new row of cell objects.
   */
  const updateRow = (rowIndex: number, newRow: Array<Cell>): void => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[rowIndex] = newRow;
      return newGrid;
    });
  };

  /**
   * Updates a single cell's data in the grid.
   *
   * Only the provided fields in `options` will be updated; missing fields will use defaults.
   *
   * @param rowIndex - The row index of the cell to update.
   * @param colIndex - The column index of the cell to update.
   * @param options - Partial cell data to update (character, status, animation, animationDelay).
   */
  const updateCell = (
    rowIndex: number,
    colIndex: number,
    options: PartialCell = {}
  ): void => {
    const {
      char = "",
      status = CellStatus.DEFAULT,
      animation = CellAnimation.NONE,
      animationDelay = 0,
    } = options;

    const newRow = [...gridRef.current[rowIndex]];
    const prevCell = newRow[colIndex];

    newRow[colIndex] = {
      ...prevCell,
      char,
      status,
      animation,
      animationDelay,
    };

    updateRow(rowIndex, newRow);
  };

  /**
   * Reset animation data after cell's animation ends.
   * @param finishedCellMap - rowIndex -> array of finished colIndices.
   */
  const flushAnimation = (
    finishedCellMap: Map<number, Array<number>>
  ): void => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];

      for (const [rowIndex, finishedCols] of finishedCellMap.entries()) {
        const newRow = [...newGrid[rowIndex]];

        finishedCols.forEach((colIndex) => {
          const cell = newRow[colIndex];
          newRow[colIndex] = {
            ...cell,
            animation: CellAnimation.NONE,
            animationDelay: 0,
          };
        });

        newGrid[rowIndex] = newRow;
      }
      return newGrid;
    });
  };

  return {
    grid,
    gridRef,
    rowNum: rowNum.current,
    colNum: colNum.current,
    updateCell,
    updateRow,
    flushAnimation,
    resetGrid,
  };
};
