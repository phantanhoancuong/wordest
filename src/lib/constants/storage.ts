/**
 * Prefix used for all persisted daily snapshot state keys in localStorage.
 *
 * This allows multiple versions of the daily snapshot state to exist,
 * making it possible to clean up older versions safely.
 */
export const DAILY_SNAPSHOT_STATE_PREFIX = "wordest:dailySnapshotState";

/** Current version of the daily snapshot state schema. */
const DAILY_SNAPSHOT_STATE_VERSION = "1.0.0";

/** Full localStorage key for the current daily snapshot state version. */
export const DAILY_SNAPSHOT_STATE_KEY = `${DAILY_SNAPSHOT_STATE_PREFIX}:${DAILY_SNAPSHOT_STATE_VERSION}`;

/** Prefix used for player stats keys in localStorage. */
export const PLAYER_STATS_STATE_PREFIX = "wordest:playerStats";

/** Current version of the player stats schema. */
const PLAYER_STATS_STATE_VERSION = "1.0.0";

/** Full localStorage key for the current player stats version. */
export const PLAYER_STATS_STATE_KEY = `${PLAYER_STATS_STATE_PREFIX}:${PLAYER_STATS_STATE_VERSION}`;
