import { StorageNamespaceConfig } from "@/lib/constants";

/**
 * Remove outdated entries from localStorage namespaces.
 *
 * Iterate through all localStorage keys and deletes any key that:
 * - Start with a namespace 'prefix', and
 * - Is NOT included in that namespace's 'activeKeys'.
 *
 * Each namspace represents a logical storage group, where 'activeKeys' define the currently valid keys that should be preserved/
 * All other matching keys are treated as stale and removed/
 *
 * The operation is wrapped in a try/catch to avoid runtime errors
 * in environment where localStorage is unavailable or access is restricted.
 *
 * @param namespaces - Array of storage namespaces configurations.
 */
export const clearOldStorageNamespaces = (
  namespaces: StorageNamespaceConfig[],
): void => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;

      for (const { prefix, activeKeys } of namespaces) {
        if (key.startsWith(prefix) && !activeKeys.includes(key)) {
          localStorage.removeItem(key);
          break;
        }
      }
    }
  } catch {}
};
