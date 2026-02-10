import { useEffect, useRef, useState } from "react";

import { useActiveSession } from "@/hooks/useActiveSession";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";
import { UseTargetWordReturn } from "@/types/useTargetWord.types";

import { fetchWordFromApi } from "@/lib/api";
import { countLetter } from "@/lib/utils";

/**
 * Hook to manage the game's target word.
 *
 * Handles fetching the target word from the API, storing it, counting its letters,
 * and exposing any fetch errors.
 */
export const useTargetWord = (): UseTargetWordReturn => {
  const { targetWord, setTargetWord } = useActiveSession();
  const [error, setError] = useState<string>(null);
  const targetLetterCount = useRef<Record<string, number>>({});

  /**
   * Clears the current target word from the store.
   *
   * Does not automatically fetch a new word.
   * Call 'reloadTargetWord' to explicitly load a replacement.
   */
  const resetTargetWord = () => {
    setTargetWord(null);
  };

  /** Fetches a new target word from the API and updates state. */
  const loadTargetWord = async (
    length: WordLength,
    activeSession: SessionType,
    ruleset: Ruleset,
  ): Promise<string | null> => {
    try {
      setError(null);
      const word = await fetchWordFromApi(length, activeSession, ruleset);
      setTargetWord(word);
      return word;
    } catch (err: unknown) {
      console.error("Failed to fetch word:", err);
      setError("Could not load the game. Please try again later.");
      return null;
    }
  };

  useEffect(() => {
    if (targetWord) {
      targetLetterCount.current = countLetter(targetWord);
    }
  }, [targetWord]);

  return {
    targetWord,
    targetLetterCount,
    wordFetchError: error,
    loadTargetWord,
    resetTargetWord,
  };
};
