import Cell from "@/components/Cell";

import { RenderCell } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";

import styles from "@/styles/Grid.module.css";
/**
 * Props for the {@link Grid} component.
 */
interface GridProps {
  grid: Array<Array<RenderCell>>;
  dataRows?: number;
  dataCols?: number;
  layoutRows?: number;
  layoutCols?: number;
  onAnimationEnd?: UseGameReturn["gameGrid"]["handleAnimationEnd"];
}

interface GridStyleVars extends React.CSSProperties {
  "--data-rows"?: number;
  "--data-cols"?: number;
  "--layout-rows"?: number;
  "--layout-cols"?: number;
}

/**
 * Renders the game board as a grid of {@link Cell} components.
 *
 * CSS grid layout is controlled by CSS variables derived from the given row and column counts.
 */
const Grid = ({
  grid,
  dataRows,
  dataCols,
  layoutRows,
  layoutCols,
  onAnimationEnd,
}: GridProps) => {
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
        ))
      )}
    </div>
  );
};

export default Grid;
