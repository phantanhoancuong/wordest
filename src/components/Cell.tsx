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
  "--bounce-duration"?: string;
  "--shake-duration"?: string;
  "--bounce-reveal-duration"?: string;
}

/**
 * Renders a single cell in the game grid with its character and animation.
 * Animation timings are applied via CSS variables from `animationTiming`.
 */
const Cell = memo(({ cell, row, col, onAnimationEnd }: CellProps) => {
  const style: CellStyleVars = {
    "--delay": `${cell.animationDelay}s`,
    "--bounce-duration": `${animationTiming.bounceDuration}s`,
    "--shake-duration": `${animationTiming.shakeDuration}s`,
    "--bounce-reveal-duration": `${animationTiming.bounceRevealDuration}s`,
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
