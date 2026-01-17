import { CellStatusType } from "@/types/cell";

export interface UseKeyStatusesReturn {
  keyStatuses: Partial<Record<string, CellStatusType>>;
  updateKeyStatuses: (guess: string, statuses: Array<CellStatusType>) => void;
  resetKeyStatuses: () => void;
}
