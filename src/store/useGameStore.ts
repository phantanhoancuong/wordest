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
import { DailySnapshot } from "@/hooks/useDailySnapshotState";

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
  targetWord: string | null;
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

  /** Hydrate the active session from a persisted daily snapshot. */
  hydrateFromSnapshot: (dailySnapshot: DailySnapshot) => void;

  /** Switch the active session (DAILY <-> PRACTICE). */
  setActiveSession: (session: SessionType) => void;

  /** Setters for session states. */
  setGameState: (gameState: GameState) => void;
  setRow: (row: number) => void;
  setCol: (col: number) => void;

  /** Replace the entire reference or game grid. */
  setReferenceGrid: (referenceGrid: DataCell[][]) => void;
  setGameGrid: (gameGrid: DataCell[][]) => void;

  /**
   * Update keyboard key statuses.
   * Accepts either a partial object or an updater function.
   *
   */
  setKeyStatuses: (
    updater:
      | Partial<Record<string, CellStatusType>>
      | ((
          prev: Partial<Record<string, CellStatusType>>,
        ) => Partial<Record<string, CellStatusType>>),
  ) => void;

  /** Set session configuration. */
  setRuleset: (ruleset: Ruleset) => void;
  setWordLength: (wordlength: WordLength) => void;

  /** Set constraint helper structured (used in strict/hardcore mode). */
  setLockedPositions: (lockedPositions: Map<number, string>) => void;
  setMinimumLetterCounts: (minimumLetterCounts: Map<string, number>) => void;

  /** Reset helpers for parts of the session state. */
  resetReferenceGrid: () => void;
  resetGameGrid: () => void;
  resetKeyStatuses: () => void;

  /** Set or clear the current target word. */
  setTargetWord: (targetWord: string | null) => void;

  /** Advance the current row (after a guess is committed). */
  incrementRow: () => void;
};

/**
 * Creates a fresh GameSession with default values.
 */
const initGameSession = (
  ruleset: Ruleset = Ruleset.NORMAL,
  wordLength: WordLength = WordLength.FIVE,
): GameSession => ({
  gameState: GameState.PLAYING,
  row: 0,
  col: 0,
  referenceGrid: initEmptyDataGrid(1, wordLength),
  gameGrid: initEmptyDataGrid(ATTEMPTS, wordLength),
  targetWord: null,
  keyStatuses: {},
  ruleset: ruleset,
  wordLength: wordLength,
  lockedPositions: new Map<number, string>(),
  minimumLetterCounts: new Map<string, number>(),
});

/**
 * Helper factory that creates a session-scoped updater:
 *
 * The updater:
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
 * - Sesssion switching.
 * - Per-session setters (operate only on the active session).
 * - Reset helpers (operate only on the active session).
 * - Row increment helper (operate only on the active session)..
 */
export const useGameStore = create<GameStore>((set) => {
  const updateSession = createUpdateSession(set);
  return {
    activeSession: SessionType.DAILY,

    // Initialize both sessions.
    sessions: new Map<SessionType, GameSession>([
      [SessionType.DAILY, initGameSession()],
      [SessionType.PRACTICE, initGameSession()],
    ]),

    /**
     * Hydrate the active session from a DailySnapshot.
     * This is used when restoring DAILY mode from localStorage.
     *
     * @param snapshot - The DailySnapshot's data to hydrate from.
     */
    hydrateFromSnapshot: (snapshot: DailySnapshot): void => {
      set((state) => {
        const sessions = new Map(state.sessions);
        const prev = sessions.get(state.activeSession);
        if (!prev) return state;

        sessions.set(state.activeSession, {
          ...prev,
          gameState: snapshot.gameState,
          gameGrid: snapshot.gameGrid,
          referenceGrid: snapshot.referenceGrid,
          row: snapshot.row,
          col: snapshot.col,
          keyStatuses: snapshot.keyStatuses,

          lockedPositions: new Map(
            Object.entries(snapshot.lockedPositions).map(([k, v]) => [
              Number(k),
              v,
            ]),
          ),
          minimumLetterCounts: new Map(
            Object.entries(snapshot.minimumLetterCounts),
          ),
        });

        return { sessions };
      });
    },

    /** Switch which session is active. */
    setActiveSession: (session: SessionType) => set({ activeSession: session }),

    /** Primitive setters. */
    setGameState: (gameState: GameState) =>
      updateSession((prev) => ({
        ...prev,
        gameState,
      })),
    setRow: (row: number) => updateSession((prev) => ({ ...prev, row })),
    setCol: (col: number) => updateSession((prev) => ({ ...prev, col })),

    /** Grid setters. */
    setReferenceGrid: (referenceGrid: DataCell[][]) =>
      updateSession((prev) => ({ ...prev, referenceGrid })),
    setGameGrid: (gameGrid: DataCell[][]) =>
      updateSession((prev) => ({ ...prev, gameGrid })),

    /** Set or clear the target word. */
    setTargetWord: (targetWord: string | null) =>
      updateSession((prev) => ({ ...prev, targetWord })),

    /**
     * Update key statuses.
     * Supports both direct replacement and functional updates.
     */
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

    /** Configuration setters. */
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

    /**Constraint helpers setters. */
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

    /** Reset helpers. */
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

    /** Advance to the next row after a guess is committed. */
    incrementRow: () => {
      updateSession((prev) => ({
        ...prev,
        row: prev.row + 1,
      }));
    },
  };
});
