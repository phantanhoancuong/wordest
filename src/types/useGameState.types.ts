import { GameState } from "@/lib/constants";

export interface UseGameStateReturn {
  state: GameState;
  setGameState: (gameState: GameState) => void;
  resetState: () => void;
}
