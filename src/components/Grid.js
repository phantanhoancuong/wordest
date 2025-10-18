import styles from "../styles/Grid.module.css";

export default function Grid({ grid }) {
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
}
