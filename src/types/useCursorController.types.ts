export interface UseCursorControllerReturn {
  row: React.RefObject<number>;
  col: React.RefObject<number>;
  pendingRowAdvance: React.RefObject<boolean>;
  advanceRow: () => void;
  advanceCol: (colLimit: number) => number | null;
  retreatCol: () => number | null;
  queueRowAdvance: () => void;
  commitPendingRowAdvance: () => void;
  resetCursor: () => void;
}
