"use client";

import { RenderCell } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";

import Cell from "@/components/client/Cell";

import styles from "@/styles/components/Grid.module.css";

/** Props for the {@link Grid} component. */
interface GridProps {
  /** 2D array of renderable cells representing the game board data. */
  grid: RenderCell[][] | RenderCell[];
  dataRows?: number;
  dataCols?: number;
  layoutRows?: number;
  layoutCols?: number;
  /** Optional callback fired when a cell animation finishes. */
  onAnimationEnd?: UseGameReturn["gameGrid"]["handleAnimationEnd"];
}

/** CSS custom properties consumed by 'Grid.module.css' to control the grid's data and layout dimensions. */
interface GridStyleVars extends React.CSSProperties {
  "--data-rows"?: number;
  "--data-cols"?: number;
  "--layout-rows"?: number;
  "--layout-cols"?: number;
}

const isGrid2D = (
  grid: RenderCell[] | RenderCell[][],
): grid is RenderCell[][] => Array.isArray(grid[0]);

/**
 * Renders the game board as a grid of {@link Cell} components.
 *
 * The visual layout is driven by CSS Grid and configured via CSS custom properties derived from the provided row and column counts.
 * If explicit dimensions are not provided, they are inferred from the {@link grid} data.
 */
function Grid({
  grid,
  dataRows,
  dataCols,
  layoutRows,
  layoutCols,
  onAnimationEnd,
}: GridProps) {
  const normalizedGrid: RenderCell[][] = isGrid2D(grid) ? grid : [grid];

  /** Inline CSS variables controlling the grid dimensions. */
  const style: GridStyleVars = {
    "--data-rows": dataRows ?? normalizedGrid.length,
    "--data-cols": dataCols ?? normalizedGrid[0].length,
    "--layout-rows": layoutRows ?? normalizedGrid.length,
    "--layout-cols": layoutCols ?? normalizedGrid[0].length,
  };

  return (
    <div className={styles["grid__container"]}>
      <div className={styles["grid"]} style={style}>
        {normalizedGrid.map((row: Array<RenderCell>, rowIndex: number) =>
          row.map((cell: RenderCell, colIndex: number) => (
            <Cell
              key={`${rowIndex}-${colIndex}-${cell.animationKey}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              onAnimationEnd={onAnimationEnd}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default Grid;
