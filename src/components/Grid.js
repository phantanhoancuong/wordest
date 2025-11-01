import styles from "../styles/Grid.module.css";
import Cell from "./Cell";

/**
 * @typedef {Object} GridProps
 * @property {Array<Array<import('./Cell').CellData>>} grid - 2D array of cell data.
 * @property {(row: number, col: number) => void} [onAnimationEnd] - Called when a cell animation ends.
 * @property {number} [dataRows] - Logical row count of the data grid.
 * @property {number} [dataCols] - Logical column count of the data grid.
 * @property {number} [layoutRows] - Visual row count (for layout or animation).
 * @property {number} [layoutCols] - Visual column count (for layout or animation).
 */

/**
 * Renders the game board as a grid of {@link Cell} components.
 *
 * CSS grid layout is controlled by CSS variables derived from the given row and column counts.
 *
 * @component
 * @param {GridProps} props
 * @returns {JSX.Element}
 */
const Grid = ({
  grid,
  onAnimationEnd,
  dataRows,
  dataCols,
  layoutRows,
  layoutCols,
}) => (
  <div
    className={styles.grid}
    style={{
      "--data-rows": dataRows ?? grid.length,
      "--data-cols": dataCols ?? grid[0].length,
      "--layout-rows": layoutRows ?? grid.length,
      "--layout-cols": layoutCols ?? grid[0].length,
    }}
  >
    {grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Cell
          key={`${rowIndex}-${colIndex}`}
          cell={cell}
          row={rowIndex}
          col={colIndex}
          onAnimationEnd={onAnimationEnd}
        />
      ))
    )}
  </div>
);

export default Grid;
