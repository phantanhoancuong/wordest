export interface UseCursorControllerReturn {
  row: React.RefObject<number>;
  col: React.RefObject<number>;
  hydrateCursor: (rowIndex: number) => void;
  resetCursor: () => void;
  advanceRow: () => void;
  advanceCol: (colLimit: number) => number | null;
  retreatCol: () => number | null;
}
