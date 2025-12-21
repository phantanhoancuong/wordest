import { RefObject } from "react";

import { CellStatus } from "@/lib/constants";

import { Cell, PartialCell } from "./cell";

export interface UseGridStateReturn {
  grid: Array<Array<Cell>>;
  gridRef: RefObject<Array<Array<Cell>>>;
  rowNum: number;
  colNum: number;
  updateCell: (
    rowIndex: number,
    colIndex: number,
    options?: PartialCell
  ) => void;
  updateRow: (rowIndex: number, newRow: Array<Cell>) => void;
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
