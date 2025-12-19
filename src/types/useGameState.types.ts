import { GameState } from "@/lib/constants";

export interface UseGameStateReturn {
  state: GameState;
  pendingState: GameState;
  queueState: (newState: GameState) => void;
  commitState: () => boolean;
  resetState: () => void;
}
