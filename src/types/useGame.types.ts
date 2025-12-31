import { GameState } from "@/lib/constants";

import { UseGridStateReturn } from "@/types/useGridState.types";
import { UseKeyStatusesReturn } from "@/types/useKeyStatuses.types";
import { UseTargetWordReturn } from "@/types/useTargetWord.types";
import { UseToastsReturn } from "@/types/useToasts";

type GameGridSection = {
  renderGrid: UseGridStateReturn["renderGrid"];
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
    gameState: GameState;
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
