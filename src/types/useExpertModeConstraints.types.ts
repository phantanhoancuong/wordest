import { CellStatusType } from "./cell";

export interface UseExpertModeConstraintsReturn {
  checkValidExpertGuess: (guess: string) => {
    isValid: boolean;
    message: string;
  };
  updateExpertConstraints: (guess: string, statuses: CellStatusType[]) => void;
}
