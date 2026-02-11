"use client";

import { useEffect } from "react";
import { clearOldDailySnapshotStateVersion } from "@/lib/utils";

export function DailySnapshotStateVersionGuard() {
  useEffect(() => {
    clearOldDailySnapshotStateVersion();
  }, []);

  return null;
}
