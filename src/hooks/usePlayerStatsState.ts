"use client";

import { useEffect } from "react";

import {
  PLAYER_STATS_STATE_KEY,
  Ruleset,
  SessionType,
  WordLength,
} from "@/lib/constants";

import { useLocalStorage } from "@/hooks";

import { enumValues, getTodayDateIndex } from "@/lib/utils";

/**
 * Aggregate stats for a single (session, ruleset, wordLength) combination.
 *
 * - gamesCompleted: total completed games.
 * - gamesWon: total wins.
 * - lastCompletedDateIndex: dateIndex of the last completed game (win or loss).
 * - lastWonDateIndex: dateIndex of the last win.
 * - streak: streaks (in days) of the player winning the game consecutively.
 * - maxStreak: longest streak that a player has gotten.
 */
type PlayerStats = {
  gamesCompleted: number;
  gamesWon: number;
  lastCompletedDateIndex: number | null;
  lastWonDateIndex: number | null;
  streak: number;
  maxStreak: number;
};

/**
 * Persisted root player stats state,
 *
 * Indexed by: stats[session][ruleset][wordLength] to PlayerStats.
 *
 * The state is eagerly initialized to a fully populated tree for all enum combinations.
 *
 */
type PlayerStatsState = {
  stats: Record<SessionType, Record<Ruleset, Record<WordLength, PlayerStats>>>;
};

/**
 * Create a PlayerStats bucket.
 *
 * If a partial stats object is provided, its values are used.
 * Missing fields are defaulted to zero or null.
 *
 * @param stats - A PlayerStats object with values to initialize with.
 * @returns A fully initialized PlayerStats object.
 */
const initPlayerStats = (stats?: Partial<PlayerStats>): PlayerStats => ({
  gamesCompleted: stats?.gamesCompleted ?? 0,
  gamesWon: stats?.gamesWon ?? 0,
  lastCompletedDateIndex: stats?.lastCompletedDateIndex ?? null,
  lastWonDateIndex: stats?.lastWonDateIndex ?? null,
  streak: stats?.streak ?? 0,
  maxStreak: stats?.maxStreak ?? 0,
});

/**
 * Create a fully initialized PlayerStatsState tree.
 *
 * This method eagerly constructs all combinations of [SessionType][Ruleset][WordLength].
 *
 * Each leaf node is initialized with a fresh PlayerStats bucket.
 *
 * @returns Fully populated PlayerStatsState.
 */
const initPlayerStatsState = (): PlayerStatsState => {
  const sessions = enumValues(SessionType);
  const rulesets = enumValues(Ruleset);
  const wordLengths = enumValues(WordLength);

  const stats = {};
  for (const session of sessions) {
    stats[session] = {};
    for (const ruleset of rulesets) {
      stats[session][ruleset] = {};
      for (const wordLength of wordLengths) {
        stats[session][ruleset][wordLength] = initPlayerStats();
      }
    }
  }
  return { stats } as PlayerStatsState;
};

/**
 * Merge persisted stats into a freshly initialized state tree.
 *
 * Behavior:
 * - Starts from a fully initialized state.
 * - For each enum combination, copies persisted values if present.
 * - Missing buckets or fields are filled with default values.
 *
 * @param persisted - Previously stored PlayerStatsState, or null.
 * @returns A fully populated PlayerStatsState.
 */
const mergeStoredStats = (persisted: PlayerStatsState | null) => {
  const freshState = initPlayerStatsState();

  if (!persisted?.stats) return freshState;

  for (const session of enumValues(SessionType)) {
    for (const ruleset of enumValues(Ruleset)) {
      for (const wordLength of enumValues(WordLength)) {
        const existing = persisted.stats?.[session]?.[ruleset]?.[wordLength];

        freshState.stats[session][ruleset][wordLength] =
          initPlayerStats(existing);
      }
    }
  }

  return freshState;
};

/**
 * React hook that manages persisted player statistics in localStorage.
 *
 * Model:
 * - A fully initialized PlayerStatsState tree is created eagerly for all [SessionType][Ruleset][WordLength] combinations.
 * - During updates, indivia
 *
 * Responsibilities:
 * - Record wins and losses.
 * - Provide read/write access to stats.
 * - Persist everything via useLocalStorage.
 *
 * @returns
 */
export const usePlayerStatsState = () => {
  const [playerStatsState, setPlayerStatsState] =
    useLocalStorage<PlayerStatsState>(
      PLAYER_STATS_STATE_KEY,
      initPlayerStatsState(),
    );

  useEffect(() => {
    const mergedState = mergeStoredStats(playerStatsState);

    if (JSON.stringify(mergedState) !== JSON.stringify(playerStatsState))
      setPlayerStatsState(mergedState);
  }, []);

  /**
   * Record a win for the given (session, ruleset, wordLength) combination.
   *
   * - Increment gamesCompleted and gamesWon.
   * - Update lastCompletedDateIndex and lastWonDateIndex to today.
   *
   * @param session - The session key.
   * @param ruleset - The ruleset key.
   * @param wordLength - The wordLength key.
   */
  const handleWon = (
    session: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
  ): void => {
    updateStats(session, ruleset, wordLength, (prev) => {
      const todayIndex = getTodayDateIndex();
      const nextStats = { ...prev };
      nextStats.streak =
        nextStats.lastWonDateIndex !== todayIndex - 1
          ? 1
          : nextStats.streak + 1;
      nextStats.maxStreak = Math.max(nextStats.maxStreak, nextStats.streak);
      nextStats.gamesCompleted += 1;
      nextStats.gamesWon += 1;
      nextStats.lastCompletedDateIndex = todayIndex;
      nextStats.lastWonDateIndex = todayIndex;
      return nextStats;
    });
  };

  /**
   * Record a loss for the given (session, ruleset, wordLength) combination.
   *
   * - Increment gamesCompleted.
   * - Update lastCompletedDateIndex to today.
   *
   * @param session - The session key.
   * @param ruleset - The ruleset key.
   * @param wordLength - The word length key.
   */
  const handleLost = (
    session: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
  ): void => {
    updateStats(session, ruleset, wordLength, (prev) => {
      const todayIndex = getTodayDateIndex();
      const nextStats = { ...prev };
      nextStats.gamesCompleted += 1;
      nextStats.lastCompletedDateIndex = todayIndex;
      nextStats.streak = 0;
      return nextStats;
    });
  };

  /**
   * Apply a partial update (patch) to a specific stats bucket.
   *
   * @param session - The session key.
   * @param ruleset - The ruleset key.
   * @param wordLength - The word length key.
   * @param patch - Partial PlayerStats fields to update.
   */
  const updateStats = (
    session: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
    updater: (prev: PlayerStats) => PlayerStats,
  ): void => {
    setPlayerStatsState((prev) => {
      const current = prev.stats[session]![ruleset]![wordLength]!;

      return {
        ...prev,
        stats: {
          ...prev.stats,
          [session]: {
            ...prev.stats[session],
            [ruleset]: {
              ...prev.stats[session]![ruleset],
              [wordLength]: updater(current),
            },
          },
        },
      };
    });
  };

  /**
   * Retrieve stats for a specific (session, ruleset, wordLength) combination.
   *
   * @param session - The session key.
   * @param ruleset  - The ruleset key.
   * @param wordLength  - The word length key.
   * @returns The PlayerStats if present, or null if not initialized.
   */
  const getStats = (
    session: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
  ): PlayerStats | null => {
    const sessionBucket = playerStatsState.stats[session];
    if (!sessionBucket) return null;

    const rulesetBucket = sessionBucket[ruleset];
    if (!rulesetBucket) return null;

    const stats = rulesetBucket[wordLength];
    if (!stats) return null;

    return stats;
  };

  /** */
  const resetAllStats = (): void => {
    setPlayerStatsState(() => initPlayerStatsState());
  };

  return {
    getStats,
    updateStats,
    handleWon,
    handleLost,
    resetAllStats,
  };
};
