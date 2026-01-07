import { CellStatusType } from "./cell";

export interface UseExpertModeConstraintsReturn {
  checkValidExpertGuess: (guess: string) => boolean;
  updateExpertConstraints: (guess: string, statuses: CellStatusType[]) => void;
}
