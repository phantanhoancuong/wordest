import styles from "../styles/Grid.module.css";

/**
 * Grid component.
 *
 * Renders the game board as a grid of cells.
 *
 * @component
 * @param {Object} props - Component props.
 * @property {Array<Array<Object>>} props.grid - 2D array of cell ojects.
 * @returns {JSX.Element} The grid element.
 */
const Grid = ({ grid }) => {
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
            className={`${styles.cell} ${
              styles[`cell--${cell.status}`]
            } flex-center`}
            style={{ "--delay": `${colIndex * 0.25}s` }}
          >
            {cell.char}
          </div>
        ))
      )}
    </div>
  );
};

export default Grid;
