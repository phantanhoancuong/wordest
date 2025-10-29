import { memo } from "react";
import styles from "../styles/Cell.module.css";
import {
  BOUNCE_ANIMATION_DURATION,
  SHAKE_ANIMATION_DURATION,
} from "@/lib/constants";

/**
 * Cell component.
 *
 * Represents a single cell in the grid, displaying its character and animation.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.cell - The cell data object.
 * @param {string} props.cell.char - The character displayed in the cell.
 * @param {string} props.cell.status - The cell's current status.
 * @param {string} [props.cell.animation] - The animation type applied to the cell.
 * @param {number} [props.cell.animationDelay] - Delay before animation starts for the cell.
 * @param {number} props.row - The row index of this cell in the grid.
 * @param {number} props.col - The column index of this cell in the grid.
 * @param {Function} [props.onAnimationEnd] - Callback fired when the animation ends.
 * @returns {JSX.Element} The rendered cell element.
 *
 */
const Cell = memo(({ cell, row, col, onAnimationEnd }) => {
  return (
    <div
      className={`${styles.cell} ${styles[`cell--${cell.status}`]} ${
        cell.animation ? styles[`cell--${cell.animation}`] : ""
      } flex-center`}
      style={{
        "--delay": `${cell.animationDelay || 0}s`,
        "--bounce-duration": `${BOUNCE_ANIMATION_DURATION}s`,
        "--shake-duration": `${SHAKE_ANIMATION_DURATION}s`,
      }}
      onAnimationEnd={() => onAnimationEnd?.(row, col)}
    >
      {cell.char}
    </div>
  );
});

export default Cell;
