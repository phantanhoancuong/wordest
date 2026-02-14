import { CellAnimation, CellStatus } from "@/lib/constants";

import {
  CellAnimationType,
  CellStatusType,
  DataCell,
  RenderCell,
} from "@/types/cell";

/**
 * Convert a 2D grid of DataCell to a 2d grid of RenderCell[][].
 *
 * - Adds in default animation information ready to be rendered.
 *
 * @param dataGrid - The DataCell grid to be converted.
 * @param animation - The initial animation value for the cells.
 * @param animationDelay - The initial animation delay for the cells.
 * @returns A 2D RenderCell grid.
 */
export const dataGridToRenderGrid = (
  dataGrid: DataCell[][],
  animation: CellAnimationType,
  animationDelay: number,
): RenderCell[][] => {
  return dataGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      animation,
      animationDelay,
    })),
  );
};

/**
 * Convert a 2D RenderCell grid back to a 2D DataCell grid.
 *
 * - Strips out animation-related properties.
 *
 * @param renderGrid - The RenderCell grid to be converted.
 * @returns A 2D DataCell grid.
 */
export const renderGridToDataGrid = (
  renderGrid: RenderCell[][],
): DataCell[][] => {
  return renderGrid.map((row) =>
    row.map(({ char, status }) => ({
      char,
      status,
    })),
  );
};

/**
 * Create a grid of data cells (no animation information).
 *
 * @param rowNum - Number of rows in the grid.
 * @param colNum - Number of columns in the grid.
 * @param defaultStatus - The status value for the grid.
 * @returns A 2D DataCell grid.
 */
export const initEmptyDataGrid = (
  rowNum: number,
  colNum: number,
  defaultStatus: CellStatusType = CellStatus.DEFAULT,
): DataCell[][] => {
  return Array.from({ length: rowNum }, () =>
    Array.from({ length: colNum }, () => ({
      char: "",
      status: defaultStatus,
    })),
  );
};

/**
 * Create a grid of RenderCell (character, status, and animation information).
 *
 * @param rowNum - Number of rows in the grid.
 * @param colNum - Number of columns in the grid.
 * @param defaultStatus- Default cell status.
 * @param defaultAnimation - Default animation type.
 * @param animationDelay - Default animation delay (in seconds).
 * @returns A 2D RenderCell grid.
 */
export const initEmptyRenderGrid = (
  rowNum: number,
  colNum: number,
  defaultStatus: CellStatusType = CellStatus.DEFAULT,
  defaultAnimation: CellAnimationType = CellAnimation.NONE,
  animationDelay = 0,
): Array<Array<RenderCell>> => {
  return Array.from({ length: rowNum }, () =>
    Array.from({ length: colNum }, () => ({
      char: "",
      status: defaultStatus,
      animation: defaultAnimation,
      animationDelay,
    })),
  );
};

/**
 * Generates an empty grid of DataCells.
 *
 * @param rows - Number of rows in the grid.
 * @param cols - Number of columns in the grid.
 * @param hidden - If true, cells use HIDDEN status (for reference grid), otherwise DEFAULT.
 * @returns 2D array of RenderCell objects.
 */
export const renderEmptyGrid = (
  rows: number,
  cols: number,
  hidden = false,
): RenderCell[][] => {
  const status = hidden ? CellStatus.HIDDEN : CellStatus.DEFAULT;

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      char: "",
      status,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    })),
  );
};

export const renderRowToDataRow = (row: RenderCell[]): DataCell[] =>
  row.map(({ char, status }) => ({ char, status }));
