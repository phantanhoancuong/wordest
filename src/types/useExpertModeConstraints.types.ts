import { CellStatusType } from "@/types/cell";

export interface UseExpertModeConstraintsReturn {
  checkValidExpertGuess: (guess: string) => {
    isValid: boolean;
    message: string;
  };
  updateExpertConstraints: (guess: string, statuses: CellStatusType[]) => void;
  resetExpertConstraints: () => void;
}
