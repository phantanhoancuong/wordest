export interface UseStrictConstraintsReturn {
  syncStrictConstraints: (
    lockedPositions: Record<number, string>,
    minimumLetterCounts: Record<string, number>,
  ) => void;
  resetStrictConstraints: () => void;
}
