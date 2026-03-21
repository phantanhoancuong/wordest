import { headers } from "next/headers";

import { eq, and } from "drizzle-orm";
import { database } from "@/lib/database/client";
import { dailyGames } from "@/lib/database/schema";

import { auth } from "@/lib/auth/auth";

import { WORD_LISTS } from "@/types/wordList.types";

import { ATTEMPTS, GameState, Ruleset, WordLength } from "@/lib/constants";

import { findOrCreateDailyGame } from "@/lib/database/queries/dailyGames";
import {
  checkValidStrictGuess,
  evaluateGuess,
  getDateString,
  updateStrictConstraints,
} from "@/lib/utils";
import { generateDailyWord } from "@/lib/words/generateWord";

/**
 * Validate a guess and update the daily game state in the database.
 *
 * With strict constraints enabled, the guess is first checked against locked positions and minimum letter counts before evaluation.
 * If the strict check fails, the game state is not updated.
 *
 * When the game ends (win of loss), return the target word so the client can reveal it in the reference row.
 *
 * @param userId - The ID of the user submitting the guess.
 * @param ruleset - The ruleset of the active game.
 * @param wordLength - The word length of the active game.
 * @param guess - The guessed word.
 * @param isStrict - Whether strict constraints should be enforced.
 * @returns An object containing 'isValid', 'message', and 'data'.
 */
async function validateAndUpdate(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
  guess: string,
  isStrict: boolean,
) {
  // If the user plays when the day rolls over, a new game may be created.
  // If the user didn't finish the last game, a message shows up to tell them a new game was created.
  const { game, isNewGame, wasIncomplete } = await findOrCreateDailyGame(
    userId,
    ruleset,
    wordLength,
  );
  if (isNewGame) {
    let message = null;
    if (wasIncomplete)
      message = `New game fetched for ${getDateString({ format: "display" })}`;
    return { isValid: false, message, data: null };
  }

  // If strict validation fails, 'message' contains the violation reason.
  if (isStrict) {
    const { isValid, message } = checkValidStrictGuess(
      guess,
      game.lockedPositions,
      game.minimumLetterCounts,
    );
    if (!isValid) return { isValid: false, message, data: null };
  }

  const targetWord = generateDailyWord(ruleset, wordLength);

  const statuses = evaluateGuess(guess, targetWord);
  const updatedGuesses = [...game.guesses, guess];

  const isWon = guess === targetWord;
  const isLost = !isWon && updatedGuesses.length >= ATTEMPTS;
  const updatedGameState = isWon
    ? GameState.WON
    : isLost
      ? GameState.LOST
      : GameState.PLAYING;

  // Spreading an empty object is a no-op.
  const strictUpdates = isStrict
    ? updateStrictConstraints(
        guess,
        statuses,
        game.minimumLetterCounts,
        game.lockedPositions,
      )
    : null;

  await database
    .update(dailyGames)
    .set({
      guesses: updatedGuesses,
      gameState: updatedGameState,
      ...(strictUpdates ?? {}),
    })
    .where(
      and(
        eq(dailyGames.userId, userId),
        eq(dailyGames.ruleset, ruleset),
        eq(dailyGames.wordLength, wordLength),
      ),
    );

  return {
    isValid: true,
    message: null,
    data: {
      statuses,
      gameState: updatedGameState,
      lockedPositions: strictUpdates?.lockedPositions ?? null,
      minimumLetterCounts: strictUpdates?.minimumLetterCounts ?? null,
      targetWord: isWon || isLost ? targetWord : null,
    },
  };
}
/**
 * POST /api/daily/validate
 *
 * Validate a daily game guess and update the game state (create the game if necessary).
 *
 * Steps:
 * 1. Authenticate the session.
 * 2. Validate the guess exists in the word list for the given length.
 * 3. If strict mode, additionally validate against locked positions and minimum letter counts.
 * 4. Persist the updated game data and return them.
 * Player-facing errors (NOT_IN_WORD_LIST and STRICT_VIOLATION) are returned with a human-readable message
 * for dipslay in the UI. Server errors are logged and returned without exposing internal details.
 *
 * @returns '{ statuses } on success, or '{ error } with an a status code on failure.

 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Anonymous auth ensures every user has a session.
    // A missing session here means something went wrong with the auth setup.
    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

    const { ruleset, wordLength, guess, isStrict } = await req.json();

    // Checking for a malformed request from the client.
    const { answers, allowed } = WORD_LISTS[guess.length];
    if (!answers || !allowed) {
      console.error(`Invalid word length received: ${guess.length}`);
      return Response.json({ error: "INVALID_WORD_LENGTH" }, { status: 400 });
    }

    // Check the guess against both the answer list and allowed list.
    const isInWordList = answers.includes(guess) || allowed.includes(guess);
    if (!isInWordList)
      return Response.json({ message: "Word not allowed." }, { status: 422 });

    const result = await validateAndUpdate(
      session.user.id,
      ruleset,
      wordLength,
      guess,
      isStrict,
    );

    if (!result.isValid)
      return Response.json({ message: result.message }, { status: 422 });

    return Response.json({ data: result.data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
