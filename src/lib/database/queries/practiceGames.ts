import "server-only";

import { and, eq } from "drizzle-orm";

import { generatePracticeWord } from "@/lib/words/generateWord";

import { database } from "@/lib/database/client";
import { practiceGames } from "@/lib/database/schema";

import { GameState, Ruleset, WordLength } from "@/lib/constants";
import { PracticeGame } from "@/types/database.types";

/**
 * Initialize a new practice game for a user with the given ruleset and word length.
 *
 * Create a fresh game record with a randomly generated target word and default values.
 * Use 'onConflictDoNothing()' to avoid overwritting existing games for the same user/ruleset/wordLength combination.
 *
 * @param userId - The ID of the user starting the game.
 * @param ruleset - The ruleset to use (NORMAL, STRICT, or HARDCORE).
 * @param wordLength - The length of the target word.
 * @returns The newly created game object.
 */
export async function initPracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<PracticeGame> {
  const newGame = {
    userId,
    ruleset,
    wordLength,
    targetWord: generatePracticeWord(wordLength),
    gameState: GameState.PLAYING,
    keyStatuses: {},
    minimumLetterCounts: {},
    lockedPositions: {},
    guesses: [],
  };
  await database.insert(practiceGames).values(newGame).onConflictDoNothing();
  return newGame;
}

/**
 * Retrieve an existing practice game. If none exists, return null.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve or create.
 * @param wordLength - The word length to retrieve or create.
 * @returns The existing or newly created game object.
 */
export async function getPracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<PracticeGame | null> {
  const [game] = await database
    .select()
    .from(practiceGames)
    .where(
      and(
        eq(practiceGames.userId, userId),
        eq(practiceGames.ruleset, ruleset),
        eq(practiceGames.wordLength, wordLength),
      ),
    )
    .limit(1);

  return game ?? null;
}

/**
 * Retrieve an existing practice game or create a new one if none exists.
 *
 * Query the database for an exisitng game matching the user, ruleset, and word length.
 *
 * If found, return the existing game state (including progress and constraints).
 * If not found, initialize a new game via {@link initPracticeGame}.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve or create.
 * @param wordLength - The word length to retrieve or create.
 * @returns The existing or newly created game object.
 */
export async function getOrCreatePracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<PracticeGame> {
  const existingGame = await database
    .select()
    .from(practiceGames)
    .where(
      and(
        eq(practiceGames.userId, userId),
        eq(practiceGames.ruleset, ruleset),
        eq(practiceGames.wordLength, wordLength),
      ),
    )
    .limit(1);

  const [game] = existingGame;
  if (game) return game;

  return initPracticeGame(userId, ruleset, wordLength);
}

export async function deletePracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<void> {
  await database
    .delete(practiceGames)
    .where(
      and(
        eq(practiceGames.userId, userId),
        eq(practiceGames.ruleset, ruleset),
        eq(practiceGames.wordLength, wordLength),
      ),
    );
}
