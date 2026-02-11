import { useEffect, useRef, useState } from "react";

import { animationTiming, CellStatus, CellAnimation } from "@/lib/constants";

import { DataCell, RenderCell } from "@/types/cell";
import { UseGridStateReturn } from "@/types/useGridState.types";

import { useLatest } from "@/hooks";

import { dataGridToRenderGrid } from "@/lib/utils";

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
  setDataGrid: (grid: DataCell[][]) => void,
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

  /** Update the renderGrid with new data from the data grid when the data grid changes. */
  useEffect(() => {
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

  const applyReferenceGridAnimation = (newRow: RenderCell[]): void => {
    const newGrid = [...renderGrid];
    newGrid[0] = newRow;
    setRenderGrid(newGrid);
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
  const flushAnimation = (finishedCellMap: Record<number, number[]>) => {
    const finalGrid = renderGridRef.current;

    const nextDataGrid = [...dataGrid];
    const nextRenderGrid = [...finalGrid];

    for (const rowKey in finishedCellMap) {
      const rowIndex = Number(rowKey);
      const cols = finishedCellMap[rowIndex];

      const dataRow = [...nextDataGrid[rowIndex]];
      const renderRow = [...nextRenderGrid[rowIndex]];

      cols.forEach((colIndex) => {
        const cell = renderRow[colIndex];

        dataRow[colIndex] = {
          ...dataRow[colIndex],
          status: cell.status,
        };

        renderRow[colIndex] = {
          ...cell,
          animation: CellAnimation.NONE,
          animationDelay: 0,
        };
      });

      nextDataGrid[rowIndex] = dataRow;
      nextRenderGrid[rowIndex] = renderRow;
    }

    setDataGrid(nextDataGrid);
    setRenderGrid(nextRenderGrid);
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

  /**
   * Applies a row animation directly onto renderGrid.
   *
   * @param rowIndex - The index of that row.
   * @param animatedRow - The RenderCell[] that is going to be updated.
   */
  const applyRowAnimation = (
    rowIndex: number,
    animatedRow: RenderCell[],
  ): void => {
    const nextRenderGrid = [...renderGrid];
    nextRenderGrid[rowIndex] = animatedRow;
    setRenderGrid(nextRenderGrid);
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
    applyRowAnimation,
  };
};
