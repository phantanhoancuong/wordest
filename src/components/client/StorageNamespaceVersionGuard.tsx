"use client";

import { useEffect } from "react";

import {
  DAILY_SNAPSHOT_STATE_KEY,
  DAILY_SNAPSHOT_STATE_PREFIX,
  PLAYER_STATS_STATE_KEY,
  PLAYER_STATS_STATE_PREFIX,
} from "@/lib/constants";

import { clearOldStorageNamespaces } from "@/lib/utils";

/**
 * Client-side guard component that cleans up outdated localStorage entries.
 *
 * Runs once on mount and invokes {@link clearOldStorageNamespaces} to remove stale keys from configured storage namespaces.
 *
 * This ensures that only the currently active, versioned keys remain in localStorage after deployments that introduce storage structure changes.
 *
 * The component renders nothing and exists solely for its side effect.
 */
function StorageNamespaceVersionGuard() {
  useEffect(() => {
    clearOldStorageNamespaces([
      {
        prefix: DAILY_SNAPSHOT_STATE_PREFIX,
        activeKeys: [DAILY_SNAPSHOT_STATE_KEY],
      },
      {
        prefix: PLAYER_STATS_STATE_PREFIX,
        activeKeys: [PLAYER_STATS_STATE_KEY],
      },
    ]);
  }, []);

  return null;
}

export default StorageNamespaceVersionGuard;
