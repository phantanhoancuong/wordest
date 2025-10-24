import styles from "../styles/Grid.module.css";

/**
 * Grid component.
 *
 * Renders the game board as a grid of cells.
 *
 * @component
 * @param {Object} props - Component props.
 * @property {Array<Array<Object>>} props.grid - 2D array of cell objects.
 * @returns {JSX.Element} The grid element.
 */
const Grid = ({ grid, onAnimationEnd }) => {
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div
      className={styles["grid"]}
      style={{
        "--rows": rows,
        "--cols": cols,
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
