import styles from "../styles/Grid.module.css";

import Cell from "./Cell";

/**
 * Grid component.
 *
 * Renders the game board as a grid of cells.
 *
 * @component
 * @param {Object} props - Component props.
 * @property {Array<Array<Object>>} props.grid - 2D array of cell objects.
 * @property {Function} [props.onAnimationEnd] - Callback fired when a cell animation ends.
 * @property {number} [props.dataRows] - Number of logical rows in the data grid.
 * @property {number} [props.dataCols] - Number of logical columns in the data grid.
 * @property {number} [props.layoutRows] - Number of visual layout rows (can differ from `dataRows` for animation/layout flexibility).
 * @property {number} [props.layoutCols] - Number of visual layout columns (can differ from `dataRows` for animation/layout flexibility).
 * @returns {JSX.Element} The grid element.
 */
const Grid = ({
  grid,
  onAnimationEnd,
  dataRows,
  dataCols,
  layoutRows,
  layoutCols,
}) => {
  return (
    <div
      className={styles["grid"]}
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
};

export default Grid;
