import { RefObject } from "react";

import { CellStatus } from "@/lib/constants";
import { RenderCell, PartialRenderCell } from "@/types/cell";

export interface UseGridStateReturn {
  renderGrid: RenderCell[][];
  renderGridRef: RefObject<RenderCell[][]>;
  rowNum: number;
  colNum: number;
  updateCell: (
    rowIndex: number,
    colIndex: number,
    options?: PartialRenderCell
  ) => void;
  updateRow: (rowIndex: number, newRow: Array<RenderCell>) => void;
  applyValidGuessAnimation: (
    rowIndex: number,
    statuses: CellStatus[],
    animationSpeedMultiplier: number
  ) => void;
  applyInvalidGuessAnimation: (
    rowIndex: number,
    animationSpeedMultiplier: number
  ) => void;
  flushAnimation: (finishedCellMap: Map<number, Array<number>>) => void;
  resetGrid: () => void;
}
