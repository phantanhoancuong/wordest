import { CellStatus } from "@/lib/constants";

import styles from "@/styles/components/PreviewGrid.module.css";

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
