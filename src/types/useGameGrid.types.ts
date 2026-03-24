import { RefObject } from "react";

import { CellStatus, WordLength } from "@/lib/constants";

import { RenderCell } from "@/types/cell.types";

export interface useGameGridReturn {
  rowNum: number;
  colNum: number;
  grid: RenderCell[][];
  gridRef: RefObject<RenderCell[][]>;
  hydrateGrid: (
    guesses: string[],
    allStatuses: CellStatus[][],
    wordLegth: WordLength,
  ) => void;
  updateCell: (
    rowIndex: number,
    colIndex: number,
    newCell: Partial<RenderCell>,
  ) => void;
  applyInvalidGuessAnimation: (rowIndex: number) => void;
  applyValidGuessAnimation: (
    rowIndex: number,
    statuses: CellStatus[],
    animationSpeedMultiplier: number,
  ) => void;
  resetGrid: () => void;
  flushAnimation: (finishedCellMap: Record<number, Array<number>>) => void;
}
