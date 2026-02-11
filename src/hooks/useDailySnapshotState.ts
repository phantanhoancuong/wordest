import {
  ATTEMPTS,
  DAILY_SNAPSHOT_STATE_KEY,
  CellStatus,
  GameState,
  Ruleset,
  WordLength,
} from "@/lib/constants";

import { CellStatusType, DataCell } from "@/types/cell";

import { useLocalStorage } from "@/hooks";

import { initEmptyDataGrid, getDateIndex } from "@/lib/utils";

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
  isNew: boolean;
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
  isNew: true,
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
      DAILY_SNAPSHOT_STATE_KEY,
      initDailySnapshotState(),
    );

  const todayIndex = dailySnapshotState.dateIndex;

  /**
   * Ensures that a snapshot exists for the given (ruleset, wordLength).
   *
   * If it does not exist yet (or the date has changed), it will be created.
   * This is a no-op if the snapshot is already present and up-to-date.
   *
   * @param ruleset - Game ruleset identifier.
   * @param wordLength - Target word length.
   */
  const ensureSnapshot = (
    ruleset: Ruleset,
    wordLength: WordLength,
  ): boolean => {
    let created = false;

    setDailySnapshotState((prev) => {
      const todayIndex = getDateIndex();

      // date rollover or missing bucket = new snapshot
      if (
        todayIndex !== prev.dateIndex ||
        !prev.snapshots[ruleset] ||
        !prev.snapshots[ruleset]?.[wordLength]
      ) {
        created = true;
      }

      return getSnapshotStateBase(prev, ruleset, wordLength);
    });

    return created;
  };

  /**
   * Returns a snapshot state that is guaranteed to contain a snapshot for the given (ruleset, wordLength), and is aligned to "today".
   *
   * Behavior:
   * - If the stored date is not today, the entire state is reset and a fresh snapshot is created for the requested (ruleset, wordLength).
   * - If today matches but the ruleset bucket does not exist, it is created.
   * - If the ruleset exists but the wordLength bucket does not, it is created.
   * - Otherwise, the previous state is returned unchanged.
   *
   * @param prev - Previous persisted DailySnapshotState.
   * @param ruleset - Game ruleset identifier.
   * @param wordLength - Target word length.
   * @returns A state object that safely contains the requested snapshot.
   */
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

  /**
   * Applies a partial update to the snapshot for (ruleset, wordLength).
   *
   * - First ensures the base snapshot exists and is for "today".
   * - Then shallow-merges the provided patch into the snapshot.
   *
   * @param ruleset - Game ruleset identifier.
   * @param wordLength - Target word length.
   * @param patch - Partial snapshot fields to update.
   */
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
              isNew: false,
            },
          },
        },
      };
    });
  };
  /**
   * Retrieves the snapshot for the given (ruleset, wordLength) if it exists and belongs to today.
   *
   * @param ruleset - Game ruleset idenfitier.
   * @param wordLength - Target word length.
   * @returns The DailySnapshot, or null if:
   * - The stored date is not today, or
   * - The ruleset bucket does not exist, or
   * - The wordLength snapshot does not exist.
   */
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

  return { todayIndex, ensureSnapshot, getSnapshot, updateSnapshot };
};
