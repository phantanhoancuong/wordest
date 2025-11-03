import { useEffect, useRef, useState } from "react";
import { fetchWordFromApi } from "../lib/api";
import { countLetter } from "../lib/utils";
import { UseTargetWordReturn } from "../types/useTargetWord.types";

/**
 * Hook to manage the game's target word.
 *
 * Handles fetching the target word from the API, storing it, counting its letters,
 * and exposing any fetch errors.
 */
export const useTargetWord = (): UseTargetWordReturn => {
  const [targetWord, setTargetWord] = useState<string>("");
  const [error, setError] = useState<string>("");
  const targetLetterCount = useRef<Record<string, number>>({});

  /** Fetches a new target word from the API and updates state. */
  const loadWord = async (): Promise<string | null> => {
    try {
      setError("");
      const word = await fetchWordFromApi();
      setTargetWord(word);
      targetLetterCount.current = countLetter(word);
      return word;
    } catch (err: unknown) {
      console.error("Failed to fetch word:", err);
      setError("Could not load the game. Please try again later.");
      return null;
    }
  };

  // Load initial word on mount
  useEffect(() => {
    loadWord();
  }, []);

  return {
    targetWord,
    targetLetterCount,
    wordFetchError: error,
    reloadTargetWord: loadWord,
  };
};
