export interface UseAnimationTrackerReturn {
  getCount: () => number;
  add: (number: number) => void;
  markEnd: (row: number, col: number) => void;
  reset: () => void;
}
