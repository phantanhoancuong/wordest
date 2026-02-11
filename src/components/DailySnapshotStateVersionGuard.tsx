"use client";

import { useEffect } from "react";

import { clearOldDailySnapshotStateVersion } from "@/lib/utils";

/**
 * Client-side guard component that cleans up outdated 'dailySnapshotState' entries from storage.
 *
 * This runs once on mount and involes {@link clearOldDailySnapshotStateVersion} to remove
 * old versions of persisted snapshot states that conflict with the current app version.
 *
 * This component renders nothing and exists solely for its side effect.
 */
function DailySnapshotStateVersionGuard() {
  useEffect(() => {
    clearOldDailySnapshotStateVersion();
  }, []);

  return null;
}

export default DailySnapshotStateVersionGuard;
