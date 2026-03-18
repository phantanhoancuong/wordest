import { GameState } from "@/lib/constants";

import { useGameGridReturn } from "@/types/useGameGrid.types";
import { UseKeyStatusesReturn } from "@/types/useKeyStatuses.types";
import { useReferenceRowReturn } from "@/types/useReferenceRow.types";
import { UseToastsReturn } from "@/types/useToasts";

export interface UseGameReturn {
  gameGrid: {
    grid: useGameGridReturn["grid"];
    rowNum: useGameGridReturn["rowNum"];
    colNum: useGameGridReturn["colNum"];
    handleAnimationEnd: (rowIndex: number, colIndex: number) => void;
  };

  referenceRow: {
    row: useReferenceRowReturn["row"];
    colNum: useReferenceRowReturn["colNum"];
    handleAnimationEnd: (colIndex: number) => void;
    isRevealing: boolean;
  };

  keyboard: {
    statuses: UseKeyStatusesReturn["keyStatuses"];
    update: UseKeyStatusesReturn["updateKeyStatuses"];
    reset: UseKeyStatusesReturn["resetKeyStatuses"];
  };

  game: {
    gameState: GameState;
    restartGame: () => void;
  };

  toasts: {
    list: UseToastsReturn["toastList"];
    addToast: UseToastsReturn["addToast"];
    removeToast: UseToastsReturn["removeToast"];
  };

  input: {
    handle: (key: string) => void;
  };

  render: {
    hasHydrated: boolean;
    serverError: string;
  };
}
