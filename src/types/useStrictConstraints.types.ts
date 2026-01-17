import { CellStatusType } from "@/types/cell";

export interface UseStrictConstraintsReturn {
  checkValidStrictGuess: (guess: string) => {
    isValid: boolean;
    message: string;
  };
  updateStrictConstraints: (guess: string, statuses: CellStatusType[]) => void;
  resetStrictConstraints: () => void;
}
