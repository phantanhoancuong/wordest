import {
  ATTEMPTS,
  CellStatus,
  GameState,
  Ruleset,
  WordLength,
} from "@/lib/constants";

import { CellStatusType, DataCell } from "@/types/cell";
import { initEmptyDataGrid, getDateIndex } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/**
 * Represents a single playable game snapshot for a given (ruleset, wordLength) on a specific day.
 *
 * This is the in-progress game state that can be persisted and restored later.
 */
export type DailySnapshot = {
  gameState: GameState;
  row: number;
  col: number;
  gameGrid: DataCell[][];
  referenceGrid: DataCell[][];
  keyStatuses: Partial<Record<string, CellStatusType>>;
  lockedPositions: Record<number, string>;
  minimumLetterCounts: Record<string, number>;
};

/**
 * Persisted state shape for all daily snapshots of a specific date.
 */
type DailySnapshotState = {
  dateIndex: number;
  snapshots: Partial<
    Record<Ruleset, Partial<Record<WordLength, DailySnapshot>>>
  >;
};

const DAILY_SNAPSHOT_KEY = "wordest:dailySnapshotState";

/**
 * Create a fresh, empty snapshot for a new game.
 */
const initDailySnapshot = (wordLength: WordLength): DailySnapshot => ({
  gameState: GameState.PLAYING,
  row: 0,
  col: 0,
  gameGrid: initEmptyDataGrid(ATTEMPTS, wordLength, CellStatus.DEFAULT),
  referenceGrid: initEmptyDataGrid(1, wordLength, CellStatus.HIDDEN),
  keyStatuses: {},
  lockedPositions: {},
  minimumLetterCounts: {},
});

/**
 * Creates a root persisted state object for daily snapshots.
 */
const initDailySnapshotState = (): DailySnapshotState => ({
  dateIndex: getDateIndex(),
  snapshots: {},
});

/**
 * Hook that manages per-day game snapshots in localStorage.
 *
 * Public API:
 * - getSnapshot(ruleset, wordLength) -> DailySnapshot | null
 * - ensureSnapshot(ruleset, wordLength)
 * - updateSnapshot(ruleset, wordLength, patch)
 * - resetSnapshot(ruleset, wordLength)
 */
export const useDailySnapshotState = () => {
  const [dailySnapshotState, setDailySnapshotState] =
    useLocalStorage<DailySnapshotState>(
      DAILY_SNAPSHOT_KEY,
      initDailySnapshotState(),
    );

  const ensureSnapshot = (ruleset: Ruleset, wordLength: WordLength): void => {
    setDailySnapshotState((prev) =>
      getSnapshotStateBase(prev, ruleset, wordLength),
    );
  };

  const getSnapshotStateBase = (
    prev: DailySnapshotState,
    ruleset: Ruleset,
    wordLength: WordLength,
  ): DailySnapshotState => {
    const todayIndex = getDateIndex();
    if (todayIndex !== prev.dateIndex) {
      return {
        dateIndex: todayIndex,
        snapshots: {
          [ruleset]: {
            [wordLength]: initDailySnapshot(wordLength),
          },
        },
      };
    }

    const rulesetBucket = prev.snapshots[ruleset];
    if (!rulesetBucket) {
      return {
        ...prev,
        snapshots: {
          ...prev.snapshots,
          [ruleset]: {
            [wordLength]: initDailySnapshot(wordLength),
          },
        },
      };
    } else if (!rulesetBucket[wordLength]) {
      return {
        ...prev,
        snapshots: {
          ...prev.snapshots,
          [ruleset]: {
            ...prev.snapshots[ruleset],
            [wordLength]: initDailySnapshot(wordLength),
          },
        },
      };
    } else {
      return prev;
    }
  };

  const updateSnapshot = (
    ruleset: Ruleset,
    wordLength: WordLength,
    patch: Partial<DailySnapshot>,
  ) => {
    setDailySnapshotState((prev) => {
      const base = getSnapshotStateBase(prev, ruleset, wordLength);

      return {
        ...base,
        snapshots: {
          ...base.snapshots,
          [ruleset]: {
            ...base.snapshots[ruleset],
            [wordLength]: {
              ...base.snapshots[ruleset][wordLength],
              ...patch,
            },
          },
        },
      };
    });
  };

  const getSnapshot = (
    ruleset: Ruleset,
    wordLength: WordLength,
  ): DailySnapshot | null => {
    const todayIndex = getDateIndex();
    if (todayIndex !== dailySnapshotState.dateIndex) return null;

    const rulesetBucket = dailySnapshotState.snapshots[ruleset];
    if (!rulesetBucket) return null;

    const snapshot = rulesetBucket[wordLength];
    if (!snapshot) return null;

    return snapshot;
  };

  return { ensureSnapshot, getSnapshot, updateSnapshot };
};
