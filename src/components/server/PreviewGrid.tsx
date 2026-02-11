import { CellStatus } from "@/lib/constants";

import styles from "@/styles/components/PreviewGrid.module.css";

/**
 * Static preview data used to demonstrate the different {@link CellStATUS} values
 * and their corresponding visual stytles.
 *
 * Each entry represents a single cell with a character and a status.
 */
const previewGridData = [
  {
    char: "W",
    status: CellStatus.CORRECT,
  },
  {
    char: "O",
    status: CellStatus.PRESENT,
  },
  {
    char: "R",
    status: CellStatus.ABSENT,
  },
  {
    char: "D",
    status: CellStatus.DEFAULT,
  },
  {
    char: "S",
    status: CellStatus.WRONG,
  },
];

/**
 * Render a small preview grid showcasing the visual appearance of each {@link CellStatus}.
 *
 * This component is intended for UI desmonstration. It allows users to see how different cell states are styled.
 */
const PreviewGrid = () => {
  return (
    <div className={styles["preview-grid"]}>
      {previewGridData.map(({ char, status }, index) => (
        <div key={index} className={styles["preview--grid__item"]}>
          <div
            className={`${styles["preview-grid__cell"]} ${styles[`preview-grid__cell--${status}`]}`}
          >
            {char}
          </div>
          <p
            className={`${styles["preview-grid__legend"]} ${styles[`preview-grid__legend--${status}`]}`}
          >
            {status}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PreviewGrid;
