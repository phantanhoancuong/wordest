import { RenderCell } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";

import Cell from "@/components/Cell";

import styles from "@/styles/components/Grid.module.css";

/** Props for the {@link Grid} component. */
interface GridProps {
  /** 2D array of renderable cells representing the game board data. */
  grid: RenderCell[][];
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
  /** Inline CSS variables controlling the grid dimensions. */
  const style: GridStyleVars = {
    "--data-rows": dataRows ?? grid.length,
    "--data-cols": dataCols ?? grid[0].length,
    "--layout-rows": layoutRows ?? grid.length,
    "--layout-cols": layoutCols ?? grid[0].length,
  };

  return (
    <div className={styles.grid} style={style}>
      {grid.map((row: Array<RenderCell>, rowIndex: number) =>
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
  );
}

export default Grid;
