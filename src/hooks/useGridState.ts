import { useEffect, useRef, useState } from "react";

import { animationTiming, CellStatus, CellAnimation } from "@/lib/constants";

import { mapGuessToRow, renderGridToDataGrid } from "@/lib/utils";

import { useLatest } from "@/hooks/useLatest";

import {
  DataCell,
  RenderCell,
  PartialRenderCell,
  CellStatusType,
} from "@/types/cell";
import { UseGridStateReturn } from "@/types/useGridState.types";
import { initEmptyRenderGrid, dataGridToRenderGrid } from "@/lib/utils";
/**
 * Manages a 2D grid of cells representing player's guesses.
 *
 * Provides utilities to update individual cells or rows, reset the grid,
 * and clear animations after they finish.
 *
 * @param row - Number of rows.
 * @param col - Number of columns.
 * @param animation - Default cell animation. Defaults to `CellAnimation.NONE`.
 * @param animationDelay - Default animation delay (seconds). Defaults to 0.
 * @param dataGrid - The grid of DataCell holding character and status information, to be converted and rendered.
 * @param resetDataGrid - The method to reset the grid of DataCell above.
 * @returns Grid state and utility functions:
 *   - `grid` - 2D array of cells.
 *   - `gridRef` - Ref always pointing to the latest grid.
 *   - `rowNum`, `colNum` - Dimensions.
 *   - `updateCell`, `updateRow`, `flushAnimation`, `resetGrid` - Utility methods.
 */
export const useGridState = (
  row: number,
  col: number,
  status: CellStatusType,
  animation: CellAnimation = CellAnimation.NONE,
  animationDelay: number = 0,
  dataGrid: DataCell[][],
  setDataGrid: (grid: DataCell[][]) => void,
  resetDataGrid: () => void
): UseGridStateReturn => {
  const rowNum = useRef(row);
  const colNum = useRef(col);
  const defaultStatus = useRef(status);
  const defaultAnimation = useRef(animation);
  const defaultAnimationDelay = useRef(animationDelay);

  const [renderGrid, setRenderGrid] = useState(() =>
    dataGridToRenderGrid(
      dataGrid,
      defaultAnimation.current,
      defaultAnimationDelay.current
    )
  );
  const renderGridRef = useLatest(renderGrid);

  /** Syncs the render grid to the external store whenever it changes. */
  useEffect(() => setDataGrid(renderGridToDataGrid(renderGrid)), [renderGrid]);

  /** Resets the grid to its initial empty state.*/
  const resetGrid = () => {
    setRenderGrid(
      initEmptyRenderGrid(
        rowNum.current,
        colNum.current,
        defaultStatus.current,
        defaultAnimation.current,
        defaultAnimationDelay.current
      )
    );
    resetDataGrid();
  };

  /**
   * Replaces an entire row in the grid with a new row array.
   *
   * @param rowIndex - Index of the row to replace.
   * @param newRow - The new row of cell objects.
   */
  const updateRow = (rowIndex: number, newRow: Array<RenderCell>): void => {
    setRenderGrid((prevGrid) => {
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
    options: PartialRenderCell = {}
  ): void => {
    const {
      char = "",
      status = CellStatus.DEFAULT,
      animation = CellAnimation.NONE,
      animationDelay = 0,
    } = options;

    const newRow = [...renderGridRef.current[rowIndex]];
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
    setRenderGrid((prevGrid: RenderCell[][]) => {
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

  /** Returns the RenderCell array for a given row. */
  const getRow = (rowIndex: number): RenderCell[] => {
    return renderGridRef.current[rowIndex];
  };

  /** Returns the guessed string for a row
   *
   * @param rowIndex - Index of the row to convert.
   * @returns The guessed word for that row.
   */
  const getRowGuess = (rowIndex: number): string => {
    const row = getRow(rowIndex);
    return row.map((cell) => cell.char).join("");
  };

  /**
   * Maps a string and an array of CellStatus to a RenderCell row and applies animation.
   *
   * @param rowIndex - Row to animate.
   * @param guess - Guess string for the row.
   * @param statuses - Cell statuses for the row.
   * @param animation - Animation type to apply.
   * @param delay - Animation delay in seconds.
   * @param isConsecutive - Whether animation is consecutive per cell.
   */
  const applyRowAnimation = (
    rowIndex: number,
    guess: string,
    statuses: CellStatus[],
    animation: CellAnimation,
    delay: number,
    isConsecutive: boolean
  ): void => {
    const newRow = mapGuessToRow(guess, statuses, {
      animation,
      animationDelay: delay,
      isConsecutive,
    });

    updateRow(rowIndex, newRow);
  };

  /**
   * Applies the "valid guess" animation to a row.
   *
   * @param rowIndex - Row to animate.
   * @param statuses - Cell statuses for the row.
   * @param animationSpeedMultiplier - Multiplier for animation delay.
   */
  const applyValidGuessAnimation = (
    rowIndex: number,
    statuses: CellStatus[],
    animationSpeedMultiplier: number
  ) => {
    const guess = getRowGuess(rowIndex);
    applyRowAnimation(
      rowIndex,
      guess,
      statuses,
      CellAnimation.BOUNCE,
      animationTiming.bounce.delay * animationSpeedMultiplier,
      true
    );
  };

  const applyInvalidGuessAnimation = (
    rowIndex: number,
    animationSpeedMultiplier: number
  ) => {
    const guess = getRowGuess(rowIndex);
    applyRowAnimation(
      rowIndex,
      guess,
      Array(getRow(rowIndex).length).fill(CellStatus.DEFAULT),
      CellAnimation.SHAKE,
      animationTiming.shake.delay * animationSpeedMultiplier,
      false
    );
  };

  return {
    renderGrid,
    renderGridRef,
    rowNum: rowNum.current,
    colNum: colNum.current,
    updateCell,
    updateRow,
    applyValidGuessAnimation,
    applyInvalidGuessAnimation,
    flushAnimation,
    resetGrid,
  };
};
