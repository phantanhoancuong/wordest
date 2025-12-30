import { create } from "zustand";
import { GameState } from "@/lib/constants";

/**
 * Global game store.
 *
 * This is used so preserve states of the game when the user switches to another page
 * then switches back.
 */
type GameStore = {
  // states of 'useGameState' hook.
  gameState: GameState;
  setGameState: (state: GameState) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: GameState.PLAYING,

  setGameState: (state) => set({ gameState: state }),
}));
