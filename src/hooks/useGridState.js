import { useRef, useState } from "react";

import { CellStatus, CellAnimation } from "../lib/constants";
import { initEmptyGrid } from "../lib/utils";

import { useLatest } from "./useLatest";

/**
 * Hook to manage 2D grid of cells representing player's guesses.
 *
 * Provides functions to update cells, replace rows, reset the grid, and clear animations once they finish.
 * @param {number} row - Total number of rows in the grid.
 * @param {number} col - Total number of columns in the grid.
 * @returns {Object} Grid state utilities.
 * @property {Array<Array<Object>>} return.grid - 2D array of cell data (character, status, animation).
 * @property {Object} return.gridRef - Ref object always pointing to the latest grid.
 * @property {Function} return.updateCell - Updates a specific cell in the grid.
 * @property {Function} return.updateRow - Replaces a full row in the grid.
 * @property {Function} return.handleAnimationEnd - Resets animation for a cell.
 * @property {Function} return.resetGrid - Clears and resets the grid.
 */
export const useGridState = (
  row,
  col,
  status = CellStatus.DEFAULT,
  animation = CellAnimation.NONE,
  animationDelay = 0
) => {
  const rowNum = useRef(row);
  const colNum = useRef(col);
  const defaultStatus = useRef(status);
  const defaultAnimation = useRef(animation);
  const defaultAnimationDelay = useRef(animationDelay);

  const [grid, setGrid] = useState(
    initEmptyGrid(
      rowNum.current,
      colNum.current,
      defaultStatus,
      defaultAnimation,
      defaultAnimationDelay
    )
  );
  const gridRef = useLatest(grid);

  /**
   * Resets the grid to its initial empty state.
   *
   * @returns {void}
   */
  const resetGrid = () => {
    setGrid(
      initEmptyGrid(
        rowNum.current,
        colNum.current,
        defaultStatus,
        defaultAnimation,
        defaultAnimationDelay
      )
    );
  };

  /**
   * Replaces an entire row in the grid with a new row array.
   *
   * @param {number} rowIndex - Index of the row to replace.
   * @param {Array<Object>} newRow - The new row of cell objects.
   * @returns {void}
   */
  const updateRow = (rowIndex, newRow) => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[rowIndex] = newRow;
      return newGrid;
    });
  };

  /**
   * Updates a single cell's data (character, status, and animation)
   *
   * @param {number} rowIndex - Row index of the cell.
   * @param {number} colIndex - Column index of the cell.
   * @param {Object} [options={}] - Optional fields to update in the cell.
   * @param {string} [options.char=""] - The character to display in the cell.
   * @param {string} [options.status=CellStatus.DEFAULT] - The visual status (default, correct, etc.).
   * @param {string} [options.animation=CellAnimation.NONE] - The animation style (shake, bounce, etc.).
   * @param {number} [options.animationDelay=0] - Amount of delay time before the animation starts.
   * @returns {void}
   */
  const updateCell = (
    rowIndex,
    colIndex,
    {
      char = "",
      status = CellStatus.DEFAULT,
      animation = CellAnimation.NONE,
      animationDelay = 0,
    } = {}
  ) => {
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
   * @param {Map<number, number[]>} finishedCellMap - rowIndex -> array of finished colIndices.
   */
  const flushAnimation = (finishedCellMap) => {
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
