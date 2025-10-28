import styles from "../styles/Grid.module.css";
import {
  BOUNCE_ANIMATION_DURATION,
  SHAKE_ANIMATION_DURATION,
} from "../lib/constants";

/**
 * Grid component.
 *
 * Renders the game board as a grid of cells.
 *
 * @component
 * @param {Object} props - Component props.
 * @property {Array<Array<Object>>} props.grid - 2D array of cell objects.
 * @property {Function} [props.onAnimationEnd] - Callback fired when a cell animation ends.
 * @property {dataRows} [props.dataRows] - Number of logical rows in the data grid.
 * @property {dataCols} [props.dataCols] - Number of logical columns in the data grid.
 * @property {layoutRows} [props.layoutRows] - Number of visual layout rows (can differ from `dataRows` for animation/layout flexibility).
 * @property {layoutCols} [props.layoutCols] - Number of visual layout columns (can differ from `dataRows` for animation/layout flexibility).
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
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${styles.cell} ${styles[`cell--${cell.status}`]} ${
              cell.animation ? styles[`cell--${cell.animation}`] : ""
            } flex-center`}
            style={{
              "--delay": `${cell.animationDelay || 0}s`,
              "--bounce-duration": `${BOUNCE_ANIMATION_DURATION}s`,
              "--shake-duration": `${SHAKE_ANIMATION_DURATION}s`,
            }}
            onAnimationEnd={() => onAnimationEnd?.(rowIndex, colIndex)}
          >
            {cell.char}
          </div>
        ))
      )}
    </div>
  );
};

export default Grid;
