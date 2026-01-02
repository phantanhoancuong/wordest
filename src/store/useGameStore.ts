import { create } from "zustand";

import { initEmptyDataGrid } from "@/lib/utils";

import { WORD_LENGTH, ATTEMPTS, CellStatus, GameState } from "@/lib/constants";

import { CellStatusType, DataCell } from "@/types/cell";

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
  answerGrid: DataCell[][];
  gameGrid: DataCell[][];
  setAnswerGrid: (grid: DataCell[][]) => void;
  setGameGrid: (grid: DataCell[][]) => void;
  resetAnswerGrid: () => void;
  resetGameGrid: () => void;

  // Target word for the player to guess.
  // Stored globally to avoid refetching on route changes.
  targetWord: string;
  setTargetWord: (word: string) => void;

  // Identifier for the current game session.
  // Incremented on restart to invalidate derived state.
  gameId: number;
  incrementGameId: () => void;

  // Tracks whether the answer grid has been initialized for the current gameId.
  answerGridId: number | null;
  setAnswerGridId: (id: number) => void;

  // Keyboard key status map.
  // Stores the strongest status per letter (correct > present > absent)
  // and persists across navigation.
  keyStatuses: Partial<Record<string, CellStatusType>>;
  setKeyStatuses: (
    updater: (
      prevKeyStatuses: Partial<Record<string, CellStatusType>>
    ) => Partial<Record<string, CellStatusType>>
  ) => void;
  resetKeyStatuses: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
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
  gameGrid: initEmptyDataGrid(ATTEMPTS, WORD_LENGTH),
  answerGrid: initEmptyDataGrid(1, WORD_LENGTH),

  setGameGrid: (grid) => set({ gameGrid: grid }),
  setAnswerGrid: (grid) => set({ answerGrid: grid }),

  resetGameGrid: () =>
    set({
      gameGrid: initEmptyDataGrid(ATTEMPTS, WORD_LENGTH, CellStatus.DEFAULT),
    }),

  resetAnswerGrid: () =>
    set({
      answerGrid: initEmptyDataGrid(1, WORD_LENGTH, CellStatus.HIDDEN),
    }),

  // Target word
  targetWord: "",
  setTargetWord: (word) => set({ targetWord: word }),

  // Game ID
  gameId: 0,
  incrementGameId: () => set((state) => ({ gameId: state.gameId + 1 })),

  answerGridId: null,
  setAnswerGridId: (id) => set({ answerGridId: id }),

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
}));
