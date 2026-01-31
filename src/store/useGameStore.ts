/** Zustand store for managing game state across multiple session types.
 *
 * Each session owns its own GameSession object:
 * - Grids (gameGrid, referenceGrid).
 * - Cursor position (row, col).
 * - Game state (gameState, gameId, referenceGridId, targetWord).
 * - Keyboard state (keyStatuses).
 * - Ruleset and word length.
 * - Constraint helpers (lockedPositions, minimumLetterCounts).
 *
 * The store keeps a Map <SessionType, GameSession> and an activeSession pointer.
 */

import { create } from "zustand";
import type { StoreApi } from "zustand";

import {
  ATTEMPTS,
  CellStatus,
  GameState,
  Ruleset,
  SessionType,
  WordLength,
} from "@/lib/constants";
import { CellStatusType, DataCell } from "@/types/cell";

import { initEmptyDataGrid } from "@/lib/utils";

/**
 * State of a single game session.
 * A session is isolated from the other.
 */
type GameSession = {
  gameState: GameState;
  row: number;
  col: number;
  referenceGrid: DataCell[][];
  gameGrid: DataCell[][];
  targetWord: string;
  gameId: number;
  referenceGridId: number | null;
  keyStatuses: Partial<Record<string, CellStatusType>>;
  ruleset: Ruleset;
  wordLength: WordLength;
  lockedPositions: Map<number, string> | null;
  minimumLetterCounts: Map<string, number> | null;
};

/**
 * Root store shape.
 *
 * - activeSession: Which session is currently being manipulated.
 * - sessions: Map of session type -> GameSession.
 * - setters: session-scope mutators that updates only the active session.
 */
type GameStore = {
  activeSession: SessionType;
  sessions: Map<SessionType, GameSession>;
  setActiveSession: (session: SessionType) => void;
  setGameState: (gameState: GameState) => void;
  setRow: (row: number) => void;
  setCol: (col: number) => void;
  setReferenceGrid: (referenceGrid: DataCell[][]) => void;
  setGameGrid: (gameGrid: DataCell[][]) => void;
  setGameId: (gameId: number) => void;
  setReferenceGridId: (referenceGridId: number) => void;
  setKeyStatuses: (
    updater:
      | Partial<Record<string, CellStatusType>>
      | ((
          prev: Partial<Record<string, CellStatusType>>,
        ) => Partial<Record<string, CellStatusType>>),
  ) => void;
  setRuleset: (ruleset: Ruleset) => void;
  setWordLength: (wordlength: WordLength) => void;
  setLockedPositions: (lockedPositions: Map<number, string>) => void;
  setMinimumLetterCounts: (minimumLetterCounts: Map<string, number>) => void;
  resetReferenceGrid: () => void;
  resetGameGrid: () => void;
  resetKeyStatuses: () => void;
  setTargetWord: (targetWord: string) => void;
  incrementGameId: () => number;
  incrementRow: () => void;
};

/**
 * Creates a fresh GameSession.
 */
const initGameSession = (): GameSession => ({
  gameState: GameState.PLAYING,
  row: 0,
  col: 0,
  referenceGrid: initEmptyDataGrid(1, WordLength.FIVE),
  gameGrid: initEmptyDataGrid(ATTEMPTS, WordLength.FIVE),
  targetWord: "",
  gameId: 0,
  referenceGridId: 0,
  keyStatuses: {},
  ruleset: null,
  wordLength: WordLength.FIVE,
  lockedPositions: new Map<number, string>(),
  minimumLetterCounts: new Map<string, number>(),
});

/**
 * Helper factory that creates a session-scoped updater:
 * - Clones the sessions Map.
 * - Reads the current active session.
 * - Applies the updater to that session only.
 * - Writes the updated session back into the Map.
 */
const createUpdateSession = (set: StoreApi<GameStore>["setState"]) => {
  return (updater: (prev: GameSession) => GameSession) => {
    set((state) => {
      const sessions = new Map(state.sessions);
      const prev = sessions.get(state.activeSession);
      if (!prev) return state;

      sessions.set(state.activeSession, updater(prev));
      return { sessions };
    });
  };
};

/**
 * Main store hook.
 *
 * Exposes:
 * - Session switching.
 * - Per-session setters.
 * - Reset helpers.
 * - ID increment helpers.
 *
 * All setters operate on the currently active session only.
 */
export const useGameStore = create<GameStore>((set, get) => {
  const updateSession = createUpdateSession(set);
  return {
    activeSession: SessionType.DAILY,
    sessions: new Map<SessionType, GameSession>([
      [SessionType.DAILY, initGameSession()],
      [SessionType.PRACTICE, initGameSession()],
    ]),
    setActiveSession: (session: SessionType) => set({ activeSession: session }),

    setGameState: (gameState: GameState) =>
      updateSession((prev) => ({
        ...prev,
        gameState,
      })),

    setRow: (row: number) => updateSession((prev) => ({ ...prev, row })),
    setCol: (col: number) => updateSession((prev) => ({ ...prev, col })),

    setReferenceGrid: (referenceGrid: DataCell[][]) =>
      updateSession((prev) => ({ ...prev, referenceGrid })),
    setGameGrid: (gameGrid: DataCell[][]) =>
      updateSession((prev) => ({ ...prev, gameGrid })),

    setTargetWord: (targetWord: string) =>
      updateSession((prev) => ({ ...prev, targetWord })),

    setGameId: (gameId: number) =>
      updateSession((prev) => ({
        ...prev,
        gameId,
      })),

    setReferenceGridId: (referenceGridId: number) =>
      updateSession((prev) => ({
        ...prev,
        referenceGridId,
      })),

    setKeyStatuses: (
      updater:
        | Partial<Record<string, CellStatusType>>
        | ((
            prev: Partial<Record<string, CellStatusType>>,
          ) => Partial<Record<string, CellStatusType>>),
    ) =>
      updateSession((prev) => {
        const nextKeyStatuses =
          typeof updater === "function" ? updater(prev.keyStatuses) : updater;

        return {
          ...prev,
          keyStatuses: nextKeyStatuses,
        };
      }),

    setRuleset: (ruleset: Ruleset) => {
      updateSession((prev) => ({
        ...prev,
        ruleset,
      }));
    },

    setWordLength: (wordLength: WordLength) => {
      updateSession((prev) => ({
        ...prev,
        wordLength,
      }));
    },

    setLockedPositions: (lockedPositions: Map<number, string>) => {
      updateSession((prev) => ({
        ...prev,
        lockedPositions,
      }));
    },

    setMinimumLetterCounts: (minimumLetterCounts: Map<string, number>) => {
      updateSession((prev) => ({
        ...prev,
        minimumLetterCounts,
      }));
    },

    resetReferenceGrid: () =>
      updateSession((prev) => ({
        ...prev,
        referenceGrid: initEmptyDataGrid(1, prev.wordLength, CellStatus.HIDDEN),
      })),

    resetGameGrid: () =>
      updateSession((prev) => ({
        ...prev,
        gameGrid: initEmptyDataGrid(ATTEMPTS, prev.wordLength),
      })),

    resetKeyStatuses: () =>
      updateSession((prev) => ({
        ...prev,
        keyStatuses: {},
      })),

    incrementGameId: () => {
      let nextId = 0;
      updateSession((prev) => {
        nextId = prev.gameId + 1;
        return { ...prev, gameId: nextId };
      });
      return nextId;
    },
    incrementRow: () => {
      updateSession((prev) => ({
        ...prev,
        row: prev.row + 1,
      }));
    },
  };
});
