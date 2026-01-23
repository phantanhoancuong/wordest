import { create } from "zustand";

import {
  ATTEMPTS,
  CellStatus,
  GameState,
  Ruleset,
  WordLength,
} from "@/lib/constants";
import { CellStatusType, DataCell } from "@/types/cell";

import { initEmptyDataGrid } from "@/lib/utils";

/**
 * Global game store.
 *
 * Persists game state across client-side route changes
 * within the same application session.
 */
type GameStore = {
  // Phase of the game.
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Active cursor position within the grid.
  row: number;
  col: number;
  setRow: (row: number | ((prev: number) => number)) => void;
  setCol: (col: number | ((prev: number) => number)) => void;

  // Persistent grid data.
  // These store the raw cell data so the game can be resumed when navigating away and back.
  referenceGrid: DataCell[][];
  gameGrid: DataCell[][];
  setReferenceGrid: (grid: DataCell[][]) => void;
  setGameGrid: (grid: DataCell[][]) => void;
  resetReferenceGrid: () => void;
  resetGameGrid: () => void;

  // Target word for the player to guess.
  // Stored globally to avoid refetching on route changes.
  targetWord: string;
  setTargetWord: (word: string) => void;

  // Identifier for the current game session.
  // Incremented on restart to invalidate derived state.
  gameId: number;
  incrementGameId: () => number;

  // Tracks whether the reference grid has been initialized for the current gameId.
  referenceGridId: number | null;
  setReferenceGridId: (id: number) => void;

  // Keyboard key status map.
  // Stores the strongest status per letter (correct > present > absent)
  // and persists across navigation.
  keyStatuses: Partial<Record<string, CellStatusType>>;
  setKeyStatuses: (
    updater: (
      prevKeyStatuses: Partial<Record<string, CellStatusType>>,
    ) => Partial<Record<string, CellStatusType>>,
  ) => void;
  resetKeyStatuses: () => void;

  sessionRuleset: Ruleset | null;
  setSessionRuleset: (newRuleset: Ruleset) => void;

  wordLength: WordLength | null;
  setWordLength: (newWordLength: WordLength) => void;

  lockedPositions: Map<number, string> | null;
  setLockedPositions: (newLockedPosition: Map<number, string>) => void;
  minimumLetterCounts: Map<string, number> | null;
  setMinimumLetterCounts: (newMinimumLetterCounts: Map<string, number>) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  wordLength: WordLength.FIVE,
  setWordLength: (newWordLength: WordLength) =>
    set({ wordLength: newWordLength }),

  // Game state
  gameState: GameState.PLAYING,
  setGameState: (gameState) => set({ gameState }),

  // Cursor
  row: 0,
  col: 0,
  setRow: (row) =>
    set((state) => ({
      row: typeof row === "function" ? row(state.row) : row,
    })),

  setCol: (col) =>
    set((state) => ({
      col: typeof col === "function" ? col(state.col) : col,
    })),

  // Grids
  gameGrid: initEmptyDataGrid(ATTEMPTS, WordLength.FIVE),
  referenceGrid: initEmptyDataGrid(1, WordLength.FIVE),

  setGameGrid: (grid) => set({ gameGrid: grid }),
  setReferenceGrid: (grid) => set({ referenceGrid: grid }),

  resetGameGrid: () =>
    set({
      gameGrid: initEmptyDataGrid(
        ATTEMPTS,
        WordLength.FIVE,
        CellStatus.DEFAULT,
      ),
    }),

  resetReferenceGrid: () =>
    set({
      referenceGrid: initEmptyDataGrid(1, WordLength.FIVE, CellStatus.HIDDEN),
    }),

  // Target word
  targetWord: "",
  setTargetWord: (word) => set({ targetWord: word }),

  // Game ID
  gameId: 0,
  incrementGameId: () => {
    set((state) => ({ gameId: state.gameId + 1 }));
    return get().gameId;
  },

  referenceGridId: null,
  setReferenceGridId: (id) => set({ referenceGridId: id }),

  // Keyboard
  keyStatuses: {},
  setKeyStatuses: (updater) =>
    set((state) => ({
      keyStatuses: updater(state.keyStatuses),
    })),
  resetKeyStatuses: () =>
    set({
      keyStatuses: {},
    }),

  sessionRuleset: null,
  setSessionRuleset: (newRuleset) => set({ sessionRuleset: newRuleset }),

  lockedPositions: new Map<number, string>(),
  setLockedPositions: (newLockedPositions) =>
    set({ lockedPositions: newLockedPositions }),
  minimumLetterCounts: new Map<string, number>(),
  setMinimumLetterCounts: (newMinimumLetterCounts) =>
    set({ minimumLetterCounts: newMinimumLetterCounts }),
}));
