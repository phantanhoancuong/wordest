import { memo } from "react";
import styles from "../styles/Cell.module.css";
import { animationTiming } from "@/lib/constants";
import { Cell as CellData } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";
import { CellAnimation } from "@/lib/constants";

/**
 * Props for the {@link Cell} component.
 */
interface CellProps {
  cell: CellData;
  row: number;
  col: number;
  onAnimationEnd?: UseGameReturn["gameGrid"]["handleAnimationEnd"];
}

interface CellStyleVars extends React.CSSProperties {
  "--delay"?: string;
  "--motion-duration"?: string;
  "--color-duration"?: string;
}

/**
 * Finds the corresponding timing config
 * by normalizing enum names to match animationTiming keys.
 */
const resolveAnimationTiming = (animation: CellAnimation) => {
  const defaultTiming = { delay: 0, motion: 0, color: 0 };

  if (animation === CellAnimation.NONE) return defaultTiming;

  const key = animation.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  ) as keyof typeof animationTiming;

  return animationTiming[key] ?? defaultTiming;
};

/**
 * Renders a single cell in the game grid with its character and animation.
 * Animation timings are applied via CSS variables from `animationTiming`.
 */
const Cell = memo(({ cell, row, col, onAnimationEnd }: CellProps) => {
  const timing = resolveAnimationTiming(cell.animation);

  const style: CellStyleVars = {
    "--delay": `${cell.animationDelay}s`,
    "--motion-duration": `${timing.motion}s`,
    "--color-duration": `${timing.color}s`,
  };

  const statusClass = styles[`cell--${cell.status}`];
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
});

export default Cell;
