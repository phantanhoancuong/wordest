import { memo } from "react";
import styles from "../styles/Cell.module.css";
import { animationTiming } from "@/lib/constants";

/**
 * Represents a single cell in the game grid.
 *
 * @typedef {Object} CellData
 * @property {string} char - The character displayed.
 * @property {string} status - Visual state ("correct", "present", etc.).
 * @property {string} [animation] - Active animation type.
 * @property {number} [animationDelay=0] - Delay before animation starts.
 */

/**
 * Props for the {@link Cell} component.
 *
 * @typedef {Object} CellProps
 * @property {CellData} cell - Cell data object.
 * @property {number} row - Row index in the grid.
 * @property {number} col - Column index in the grid.
 * @property {(row: number, col: number) => void} [onAnimationEnd] - Fired when animation ends.
 */

/**
 * Renders a single cell in the game grid with its character and animation.
 * Animation timings use values from {@link animationTiming}.
 *
 * @component
 * @param {CellProps} props
 * @returns {JSX.Element}
 */
const Cell = memo(
  /** @param {CellProps} props */
  ({ cell, row, col, onAnimationEnd }) => (
    <div
      className={`${styles.cell} ${styles[`cell--${cell.status}`]} ${
        cell.animation ? styles[`cell--${cell.animation}`] : ""
      } flex-center`}
      style={{
        "--delay": `${cell.animationDelay || 0}s`,
        "--bounce-duration": `${animationTiming.bounceDuration}s`,
        "--shake-duration": `${animationTiming.shakeDuration}s`,
        "--bounce-reveal-duration": `${animationTiming.bounceRevealDuration}s`,
      }}
      onAnimationEnd={() => onAnimationEnd?.(row, col)}
    >
      {cell.char}
    </div>
  )
);

export default Cell;
