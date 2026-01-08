import { RefObject } from "react";

export interface UseTargetWordReturn {
  targetWord: string;
  targetLetterCount: RefObject<Record<string, number>>;
  wordFetchError: string;
  loadTargetWord: (length) => Promise<string | null>;
  resetTargetWord: () => void;
}
