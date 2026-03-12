import { RefObject } from "react";

import { CellStatus, WordLength } from "@/lib/constants";

import { RenderCell } from "@/types/cell";

export interface useReferenceRowReturn {
  colNum: number;
  row: RenderCell[];
  rowRef: RefObject<RenderCell[]>;
  hydrateRow: (
    guesses: string[],
    allStatuses: CellStatus[][],
    wordLegth: WordLength,
  ) => void;
  updateRow: (newRow: Partial<RenderCell[]>) => void;
  resetRow: () => void;
  applyRowAnimation: (newRow: RenderCell[]) => void;
  flushAnimation: (finishedCellMap: Record<number, number[]>) => void;
}
