import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth/auth";
import { database } from "@/lib/database/client";

import { ATTEMPTS, GameState, Ruleset, WordLength } from "@/lib/constants";

import {
  checkValidStrictGuess,
  evaluateGuess,
  updateStrictConstraints,
} from "@/lib/utils";
import { findOrCreatePracticeGame } from "@/lib/database/queries/practiceGames";
import { practiceGames } from "@/lib/database/schema";

import { WORD_LISTS } from "@/types/wordList.types";

/**
 * Validate a guess and update the practice game state in the database.
 *
 * With strict constraints enabled, the guess is first checked against locked positions and minimum letter counts before evaluation.
 * If the strict check fails, the game state is not updated.
 *
 * When the game ends (win or loss), returns the target word so the client can reveal it in the reference row.
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
  const game = await findOrCreatePracticeGame(userId, ruleset, wordLength);

  // If strict validation fails, 'message' contains the violation reason.
  if (isStrict) {
    const { isValid, message } = checkValidStrictGuess(
      guess,
      game.lockedPositions,
      game.minimumLetterCounts,
    );
    if (!isValid) return { isValid: false, message, data: null };
  }

  const statuses = evaluateGuess(guess, game.targetWord);
  const updatedGuesses = [...game.guesses, guess];

  const isWon = guess === game.targetWord;
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
    .update(practiceGames)
    .set({
      guesses: updatedGuesses,
      gameState: updatedGameState,
      ...(strictUpdates ?? {}),
    })
    .where(
      and(
        eq(practiceGames.userId, userId),
        eq(practiceGames.ruleset, ruleset),
        eq(practiceGames.wordLength, wordLength),
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
      targetWord: isWon || isLost ? game.targetWord : null,
    },
  };
}

/**
 * POST /api/practice/validate
 *
 * Validate a practice game guess and update the game state (create the game if necessary).
 *
 * Steps:
 * 1. Authenticate the session.
 * 2. Validate the guess exists in the word list for the given length.
 * 3. If strict mode, additionally validate against locked positions and mininum letter counts before updating.
 * 4. Persist the updated game state and return evaluated cell statuses.
 *
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
    if (!ruleset || !wordLength || !guess || isStrict === undefined) {
      console.error("Malformed request.");
      return Response.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    // Look up the word list for the given guess length.
    // If none exists, the client sent an unsupported word length.
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

    // Strict constraints violation.
    if (!result.isValid)
      return Response.json({ message: result.message }, { status: 422 });

    // Return the processed data so the client can update the grid and animations.
    return Response.json({ data: result.data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
