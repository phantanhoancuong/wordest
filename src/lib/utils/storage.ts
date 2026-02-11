import {
  DAILY_SNAPSHOT_STATE_KEY,
  DAILY_SNAPSHOT_STATE_PREFIX,
} from "@/lib/constants";

/**
 * Remove outdated daily snapshot entries from localStorage.
 *
 * Iterate through all localStorage keys and deletes any key that:
 * - Starts with 'DAILY_SNAPSHOT_STATE_PREFIX', and
 * - Is NOT the current 'DAILY_SNAPSHOT_STATE_KEY'.
 *
 * This is used to clean up old snapshot versions after a schema or key change.
 * The operation is wrapped in a try/catch to avoid crashing in
 * environments where localStorage is unavailable or access is restricted.
 */
export const clearOldDailySnapshotStateVersion = (): void => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.startsWith(DAILY_SNAPSHOT_STATE_PREFIX) &&
        key !== DAILY_SNAPSHOT_STATE_KEY
      )
        localStorage.removeItem(key);
    }
  } catch {}
};
