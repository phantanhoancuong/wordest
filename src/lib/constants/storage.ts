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
