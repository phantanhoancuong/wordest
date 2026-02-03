import { RefObject } from "react";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";

export interface UseTargetWordReturn {
  targetWord: string;
  targetLetterCount: RefObject<Record<string, number>>;
  wordFetchError: string;
  loadTargetWord: (
    length: WordLength,
    activeSession: SessionType,
    ruleset: Ruleset,
  ) => Promise<string | null>;
  resetTargetWord: () => void;
}
