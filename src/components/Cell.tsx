import { memo } from "react";

import { animationTiming, CellAnimation } from "@/lib/constants";
import { RenderCell } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";

import styles from "@/styles/components/Cell.module.css";

/** Props for the {@link Cell} component. */
interface CellProps {
  /** Renderable cell data. */
  cell: RenderCell;
  row: number;
  col: number;
  /** Optional callcback fired when the cell's animation finishes. */
  onAnimationEnd?: UseGameReturn["gameGrid"]["handleAnimationEnd"];
}

/**
 * CSS custom properties consumed by 'Cell.module.css' to control per-cell animation timing.
 */
interface CellStyleVars extends React.CSSProperties {
  "--delay"?: string;
  "--motion-duration"?: string;
  "--color-duration"?: string;
}

/**
 * Resolved timing values for a cell animation.
 * All values are in seconds.
 */
type AnimationTiming = {
  delay: number;
  motion: number;
  color: number;
};

/**
 * Resolve the timing configuration for a given cell animation.
 *
 * This normalizes the {@link CellAnimation} enum value
 * into the corresponding key used by {@link animationTiming}.
 *
 * If the animation is {@link CellAnimation.NONE} or no timing is found,
 * a zeroed timing config is returned.
 *
 * @param animation - The cell animation type.
 * @returns An object containing delay, motion, and color durations.
 */
const resolveAnimationTiming = (animation: CellAnimation): AnimationTiming => {
  const defaultTiming = { delay: 0, motion: 0, color: 0 };

  if (animation === CellAnimation.NONE) return defaultTiming;

  const key = animation.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase(),
  ) as keyof typeof animationTiming;

  return animationTiming[key] ?? defaultTiming;
};

/**
 * Renders a single cell in the game grid with its character and animation.
 * Animation timings are applied via CSS variables from `animationTiming`.
 */

/**
 * Renders a single cell in the game grids.
 *
 * The cell displays its character and applies status- and animation-specific styles.
 * Animation timing are passed to CSS via custom properties derived from {@link animationTiming}.
 */
function Cell({ cell, row, col, onAnimationEnd }: CellProps) {
  const timing = resolveAnimationTiming(cell.animation);

  /** Inline CSS variables controlling animation timing for this cell. */
  const style: CellStyleVars = {
    "--delay": `${cell.animationDelay}s`,
    "--motion-duration": `${timing.motion}s`,
    "--color-duration": `${timing.color}s`,
  };

  /** CSS class for the cell's current status.*/
  const statusClass = styles[`cell--${cell.status}`];

  /** CSS class for the cell's current animation, if any. */
  const animationClass =
    cell.animation !== CellAnimation.NONE
      ? styles[`cell--${cell.animation}`]
      : "";

  return (
    <div
      className={`${styles.cell} ${statusClass} ${animationClass} flex-center`}
      style={style}
      onAnimationEnd={() => onAnimationEnd?.(row, col)}
    >
      {cell.char}
    </div>
  );
}

export default memo(Cell);
