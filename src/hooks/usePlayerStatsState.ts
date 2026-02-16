"use client";

import {
  PLAYER_STATS_STATE_KEY,
  Ruleset,
  SessionType,
  WordLength,
} from "@/lib/constants";

import { useLocalStorage } from "@/hooks";

import { getDateIndex } from "@/lib/utils";

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
 * Root persisted player stats state.
 *
 * Indexed by: stats[session][ruleset][wordLength] -> PlayerStats.
 *
 * All levels are Partial to allow lazy initialization on demand.
 */
type PlayerStatsState = {
  stats: Partial<
    Record<
      SessionType,
      Partial<Record<Ruleset, Partial<Record<WordLength, PlayerStats>>>>
    >
  >;
};

/** Create a fresh PlayerStats bucket with zeroed counters. */
const initPlayerStats = (stats?: Partial<PlayerStats>): PlayerStats => ({
  gamesCompleted: stats?.gamesCompleted ?? 0,
  gamesWon: stats?.gamesWon ?? 0,
  lastCompletedDateIndex: stats?.lastCompletedDateIndex ?? null,
  lastWonDateIndex: stats?.lastWonDateIndex ?? null,
  streak: stats?.streak ?? 0,
  maxStreak: stats?.maxStreak ?? 0,
});

/** Create an empty root stats state. */
const initPlayerStatsState = (): PlayerStatsState => ({
  stats: {},
});

/**
 * React hook that manages persisted player statistics in localStorage.
 *
 * Responsibilities:
 * - Lazily initialize stats buckets for (session, ruleset, wordLength).
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
    ensureStats(session, ruleset, wordLength);

    updateStats(session, ruleset, wordLength, (prev) => {
      const todayIndex = getDateIndex();
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
    ensureStats(session, ruleset, wordLength);
    updateStats(session, ruleset, wordLength, (prev) => {
      const todayIndex = getDateIndex();
      const nextStats = { ...prev };
      nextStats.gamesCompleted += 1;
      nextStats.lastCompletedDateIndex = todayIndex;
      nextStats.streak = 0;
      return nextStats;
    });
  };

  /**
   * Ensure that a stats bucket exists for the given (session, ruleset, wordLength) combination.
   *
   * If any level is missing, it will be created with default values.
   *
   * @param session - The session key.
   * @param ruleset - The ruleset key.
   * @param wordLength - The word length key.
   */
  const ensureStats = (
    session: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
  ): void => {
    setPlayerStatsState((prev) => {
      return getStatsStateBase(prev, session, ruleset, wordLength);
    });
  };

  /**
   * Create or normalize a PlayerStats bucket.
   *
   * - If called with no argument, return a fresh bucket with default values.
   * - If called with a partial bucket (e.g. from older storage), fill in any missing or undefined fields with defaults.
   *
   * @param stats - Optional partial PlayerStats (e.g. loaded from older or incomplete persisted storage).
   * @returns A fully-initialized PlayerStats object.
   */
  const getStatsStateBase = (
    prev: PlayerStatsState,
    session: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
  ): PlayerStatsState => {
    const existing = prev.stats[session]?.[ruleset]?.[wordLength];

    const normalized = initPlayerStats(existing);

    return {
      ...prev,
      stats: {
        ...prev.stats,
        [session]: {
          ...(prev.stats[session] ?? {}),
          [ruleset]: {
            ...(prev.stats[session]?.[ruleset] ?? {}),
            [wordLength]: normalized,
          },
        },
      },
    };
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
      const base = getStatsStateBase(prev, session, ruleset, wordLength);
      const current = base.stats[session]![ruleset]![wordLength]!;

      return {
        ...base,
        stats: {
          ...base.stats,
          [session]: {
            ...base.stats[session],
            [ruleset]: {
              ...base.stats[session]![ruleset],
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

  return { ensureStats, getStats, updateStats, handleWon, handleLost };
};
