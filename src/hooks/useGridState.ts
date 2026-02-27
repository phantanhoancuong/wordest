"use client";

import { useEffect, useRef, useState } from "react";

import { animationTiming, CellStatus, CellAnimation } from "@/lib/constants";

import { DataCell, RenderCell } from "@/types/cell";
import { UseGridStateReturn } from "@/types/useGridState.types";

import { useLatest } from "@/hooks";

import { dataGridToRenderGrid, renderRowToDataRow } from "@/lib/utils";

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
  status: CellStatus,
  animation: CellAnimation = CellAnimation.NONE,
  animationDelay: number = 0,
  dataGrid: DataCell[][],
  setDataGrid: (
    updater: DataCell[][] | ((prev: DataCell[][]) => DataCell[][]),
  ) => void,
  resetDataGrid: () => void,
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
      defaultAnimationDelay.current,
    ),
  );
  const renderGridRef = useLatest(renderGrid);
  const isAnimating = useRef<boolean>(false);

  /** Update the renderGrid with new data from the data grid when the data grid changes. */
  useEffect(() => {
    if (isAnimating.current) return;
    setRenderGrid(dataGridToRenderGrid(dataGrid, CellAnimation.NONE, 0));
  }, [dataGrid]);

  /** Resets the grid to its initial empty state.*/
  const resetGrid = () => {
    resetDataGrid();
  };

  /**
   * Replaces an entire row in the grid with a new row array.
   *
   * @param rowIndex - Index of the row to replace.
   * @param newRow - The new row of cell objects.
   */
  const updateRow = (rowIndex: number, newRow: DataCell[]): void => {
    const newGrid = [...dataGrid];
    newGrid[rowIndex] = newRow;
    setDataGrid(newGrid);
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
    newCell: DataCell = { char: "", status: defaultStatus.current },
  ): void => {
    const prevRow = dataGrid[rowIndex];
    const newRow = [...prevRow];
    newRow[colIndex] = newCell;
    updateRow(rowIndex, newRow);
  };

  /**
   * Reset animation data after cell's animation ends.
   * @param finishedCellMap - rowIndex -> array of finished colIndices.
   */
  const flushAnimation = () => {
    setRenderGrid(dataGridToRenderGrid(dataGrid, CellAnimation.NONE, 0));
    isAnimating.current = false;
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
    animationSpeedMultiplier: number,
  ) => {
    isAnimating.current = true;
    setDataGrid((prevDataGrid) => {
      const nextDataRow = prevDataGrid[rowIndex].map(
        (cell: DataCell, index: number) => ({
          ...cell,
          status: statuses[index],
        }),
      );
      const nextDataGrid = [...prevDataGrid];
      nextDataGrid[rowIndex] = nextDataRow;
      return nextDataGrid;
    });

    setRenderGrid((prevRenderGrid) => {
      const animatedRow = prevRenderGrid[rowIndex].map(
        (cell: RenderCell, i: number) => ({
          ...cell,
          status: statuses[i],
          animation: CellAnimation.BOUNCE,
          animationDelay:
            i * animationTiming.bounce.delay * animationSpeedMultiplier,
        }),
      );
      const nextRenderGrid = [...prevRenderGrid];
      nextRenderGrid[rowIndex] = animatedRow;
      return nextRenderGrid;
    });
  };

  /**
   * A specific API to apply new animations on the reference grid, requires only one row.
   *
   * @param newRow - The RenderCell[] to update the grid with.
   */
  const applyReferenceGridAnimation = (newRow: RenderCell[]): void => {
    console.log("apply reference grid animation!");
    console.log(newRow);
    isAnimating.current = true;
    setDataGrid((prevDataGrid) => {
      const newDataGrid = [...prevDataGrid];
      newDataGrid[0] = renderRowToDataRow(newRow);
      return newDataGrid;
    });

    setRenderGrid((prevRenderGrid) => {
      const newRenderGrid = [...prevRenderGrid];
      newRenderGrid[0] = newRow;
      return newRenderGrid;
    });
  };

  /**
   * Applies the "invalid guess" animation to a row (incomplete guess, words that are not in the list, etc.).
   *
   * @param rowIndex - Row to animate.
   */
  const applyInvalidGuessAnimation = (rowIndex: number): void => {
    setRenderGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const prevRow = newGrid[rowIndex];
      const newRow = prevRow.map((cell: RenderCell) => ({
        ...cell,
        animation: CellAnimation.SHAKE,
        animationDelay: 0,
      }));

      newGrid[rowIndex] = newRow;
      return newGrid;
    });
  };

  return {
    renderGrid,
    renderGridRef,
    rowNum: rowNum.current,
    colNum: colNum.current,
    updateCell,
    updateRow,
    applyReferenceGridAnimation,
    applyValidGuessAnimation,
    applyInvalidGuessAnimation,
    flushAnimation,
    resetGrid,
  };
};
