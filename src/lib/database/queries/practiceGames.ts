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
 * Create a fresh game record with a randomly generated target word and default game states.
 * If there already exists a game for the same user + ruleset + word length then overwrite the game with the new default values.
 *
 * @param userId - The ID of the user starting the game.
 * @param ruleset - The ruleset to use (NORMAL, STRICT, or HARDCORE).
 * @param wordLength - The length of the target word.
 * @returns The newly created game object.
 */
async function createPracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<PracticeGame> {
  const targetWord = generatePracticeWord(wordLength);

  const [game] = await database
    .insert(practiceGames)
    .values({
      userId,
      ruleset,
      wordLength,
      targetWord,
    })
    .onConflictDoUpdate({
      target: [
        practiceGames.userId,
        practiceGames.ruleset,
        practiceGames.wordLength,
      ],
      set: {
        targetWord,
        gameState: GameState.PLAYING,
        lockedPositions: {},
        minimumLetterCounts: {},
        guesses: [],
      },
    })
    .returning();

  return game;
}

/**
 * Retrieve an existing practice game. If none exists, return null.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve.
 * @param wordLength - The word length to retrieve.
 * @returns The existing game object or null if none exists.
 */
export async function findPracticeGame(
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
 * If not found, initialize a new game via {@link createPracticeGame}.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve or create.
 * @param wordLength - The word length to retrieve or create.
 * @returns The existing or newly created game object.
 */
export async function findOrCreatePracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<PracticeGame> {
  const game = await findPracticeGame(userId, ruleset, wordLength);
  if (game) return game;
  return createPracticeGame(userId, ruleset, wordLength);
}

/**
 * Delete a specific practice game for a user.
 *
 * This is a no-op if no game exists to delete.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to delete.
 * @param wordLength - The word length to delete.
 */
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
