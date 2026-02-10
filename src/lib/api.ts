import { Ruleset, SessionType, WordLength } from "@/lib/constants";

interface FetchWordResponse {
  target: string;
  error?: string;
}

interface ValidateWordResponse {
  valid: boolean;
  error?: string;
  [key: string]: any;
}

interface ValidationResult {
  status: number;
  ok: boolean;
  data: ValidateWordResponse | null;
}

/**
 * Fetches a random target word from the API.
 *
 * Converts the returned word to uppercase before returning.
 *
 * @async
 * @param wordLength - The length of the guess.
 * @param session - The game session type (SessionType.DAILY, SessionType.PRACTICE)
 * @param ruleset - The ruleset the game uses (Ruleset.NORMAL, Ruleset.STRICT, Ruleset.HARDCORE)
 * @returns The target word in uppercase.
 * @throws {Error} If the HTTP request fails or the response is invalid.
 */
export const fetchWordFromApi = async (
  wordLength: WordLength,
  session: SessionType,
  ruleset: Ruleset,
): Promise<string> => {
  const result = await fetch(
    `/api/word?length=${wordLength}&session=${session}&ruleset=${ruleset}`,
  );

  if (!result.ok) {
    throw new Error(`HTTP error! Status: ${result.status}`);
  }

  const data: FetchWordResponse = await result.json();

  if (data.error || !data.target) {
    throw new Error(data.error ?? "Invalid server response!");
  }

  return data.target.toUpperCase();
};

/**
 * Validates a guessed word against the dictionary API.
 *
 * Sends the guess in a POST request and returns the response details.
 *
 * @async
 * @param {string} word - The guessed word to validate.
 * @param wordLenght - Length of the word being played.
 * @returns {Promise<{status: number, ok: boolean, data: any}>} The validation result object.
 */
export const validateWord = async (
  word: string,
  wordLength: number,
): Promise<ValidationResult> => {
  try {
    const result = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guess: word,
        length: wordLength,
      }),
    });

    const data: ValidateWordResponse = await result.json();

    return {
      status: result.status,
      ok: result.ok,
      data,
    };
  } catch (error: unknown) {
    console.error("Error validating word:", error);
    return { status: 500, ok: false, data: null };
  }
};
