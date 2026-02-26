export interface UseCursorControllerReturn {
  row: React.RefObject<number>;
  col: React.RefObject<number>;
  advanceRow: () => void;
  advanceCol: (colLimit: number) => number | null;
  retreatCol: () => number | null;
  resetCursor: () => void;
}
