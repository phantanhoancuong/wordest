import { useEffect, useRef, useState } from "react";
import { fetchWordFromApi } from "../lib/api";
import { countLetter } from "../lib/utils";

/**
 * Hook to manage the game's target word.
 *
 * Handles fetching the target word from the API, storing it, counting its letters,
 * and exposing any fetch errors.
 *
 * @returns {{
 *   targetWord: string,
 *   targetLetterCount: import('react').MutableRefObject<Record<string, number>>,
 *   wordFetchError: string,
 *   reloadTargetWord: () => Promise<string|null>
 * }}
 */
export const useTargetWord = () => {
  const [targetWord, setTargetWord] = useState("");
  const [error, setError] = useState("");
  const targetLetterCount = useRef({});

  /** Fetches a new target word from the API and updates state. */
  const loadWord = async () => {
    try {
      setError("");
      const word = await fetchWordFromApi();
      setTargetWord(word);
      targetLetterCount.current = countLetter(word);
      return word;
    } catch (err) {
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
