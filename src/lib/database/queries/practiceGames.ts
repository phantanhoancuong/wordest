import { and, eq } from "drizzle-orm";

import { generatePracticeWord } from "@/lib/words/generateWord";

import { database } from "@/lib/database/client";
import { practiceGames } from "@/lib/database/schema";

import { GameState, Ruleset, WordLength } from "@/lib/constants";

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
) {
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
 * Restart an existing practice game by resetting state and generating a new target word.
 * 
 * Use 'onConflictDoUpdate()' to update the existing game record for the given user/ruleset/wordLength combination.

 * @param userId - The ID of the user restarting the game.
 * @param ruleset - The ruleset of the game to restart.
 * @param wordLength - The word length of the game to restart.
 * @returns The restarted (or newly created) game object.
 */
export async function restartPracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
) {
  const [game] = await database
    .insert(practiceGames)
    .values({
      userId,
      ruleset,
      wordLength,
      targetWord: generatePracticeWord(wordLength),
    })
    .onConflictDoUpdate({
      target: [
        practiceGames.userId,
        practiceGames.ruleset,
        practiceGames.wordLength,
      ],
      set: {
        targetWord: generatePracticeWord(wordLength),
        guesses: [],
        gameState: GameState.PLAYING,
        lockedPositions: {},
        minimumLetterCounts: {},
      },
    })
    .returning();

  return game;
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
export async function getPracticeGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
) {
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
