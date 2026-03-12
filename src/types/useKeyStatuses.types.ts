import { CellStatus } from "@/lib/constants";

export interface UseKeyStatusesReturn {
  keyStatuses: Partial<Record<string, CellStatus>>;
  hydrateKeyStatuses: (guesses: string[], allStatuses: CellStatus[][]) => void;
  updateKeyStatuses: (guess: string, statuses: CellStatus[]) => void;
  resetKeyStatuses: () => void;
}
