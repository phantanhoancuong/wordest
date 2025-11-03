import { UseGridStateReturn } from "./useGridState.types";
import { UseKeyStatusesReturn } from "./useKeyStatuses.types";
import { UseTargetWordReturn } from "./useTargetWord.types";
import { UseToastsReturn } from "./useToasts";

type GameGridSection = {
  data: UseGridStateReturn["grid"];
  rowNum: UseGridStateReturn["rowNum"];
  colNum: UseGridStateReturn["colNum"];
  handleAnimationEnd: (rowIndex: number, colIndex: number) => void;
};

export interface UseGameReturn {
  gameGrid: GameGridSection;

  answerGrid: GameGridSection;

  keyboard: {
    statuses: UseKeyStatusesReturn["keyStatuses"];
    update: UseKeyStatusesReturn["updateKeyStatuses"];
    reset: UseKeyStatusesReturn["resetKeyStatuses"];
  };

  game: {
    gameOver: boolean;
    validationError: string;
    wordFetchError: string;
    targetWord: UseTargetWordReturn["targetWord"];
    restartGame: () => void;
  };

  toasts: {
    list: UseToastsReturn["toastList"];
    removeToast: UseToastsReturn["removeToast"];
  };

  input: {
    handle: (key: string) => void;
  };
}
