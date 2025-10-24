import { useEffect, useRef, useState } from "react";
import { fetchWordFromApi } from "../lib/api";
import { countLetter } from "../lib/utils";

/**
 * Hook to manage the game's target word.
 *
 * Handles fetching a new target word from the API, evaluating guesses, and storing error messages during the fetch.

 * @returns {Object} Target word state utilities
 * @property {string} targetWord - The current word to be guessed
 * @property {Object} targetLetterCount - Ref object mapping letters to their counts in the target word
 * @property {string} wordFetchError - Error message if fetching the word failed
 * @property {Function} reloadTargetWord - Fetches a new target word and updates state
 */
export const useTargetWord = () => {
  const [targetWord, setTargetWord] = useState("");
  const [error, setError] = useState("");
  const targetLetterCount = useRef({});

  /**
   * Fetches a new a target word from the API and update state.
   *
   * @async
   * @returns {Promise<string|null>} The fetched word, or null if fetch failed
   */
  const loadWord = async () => {
    try {
      setError("");
      const word = await fetchWordFromApi();
      setTargetWord(word);
      targetLetterCount.current = countLetter(word);
      return word;
    } catch (error) {
      console.error("Failed to fetch word: ", error);
      setError("Could not load the game. Please try again later.");
      return null;
    }
  };

  /**
   * Loads a target word when the hook is first mounted
   */
  useEffect(() => {
    loadWord();
  }, []);

  return {
    targetWord: targetWord,
    targetLetterCount: targetLetterCount,
    wordFetchError: error,
    reloadTargetWord: loadWord,
  };
};
