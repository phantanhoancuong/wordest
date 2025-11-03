interface FetchWordReponse {
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
 * @returns The target word in uppercase.
 * @throws {Error} If the HTTP request fails or the response is invalid.
 */
export const fetchWordFromApi = async (): Promise<string> => {
  const res = await fetch("/api/word");
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  const data: FetchWordReponse = await res.json();
  if (data.error) throw new Error(data.error || "Invalid server response");
  return data.target.toUpperCase();
};

/**
 * Validates a guessed word against the dictionary API.
 *
 * Sends the guess in a POST request and returns the response details.
 *
 * @async
 * @param {string} word - The guessed word to validate.
 * @returns {Promise<{status: number, ok: boolean, data: any}>} The validation result object.
 */
export const validateWord = async (word: string): Promise<ValidationResult> => {
  try {
    const result = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess: word }),
    });

    const data = await result.json();
    return { status: result.status, ok: result.ok, data };
  } catch (error: unknown) {
    console.error("Error validating word:", error);
    return { status: 500, ok: false, data: null };
  }
};
