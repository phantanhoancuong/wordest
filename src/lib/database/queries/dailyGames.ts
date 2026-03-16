import "server-only";

import { and, eq } from "drizzle-orm";

import { database } from "@/lib/database/client";
import { dailyGames } from "@/lib/database/schema";

import { GameState, Ruleset, WordLength } from "@/lib/constants";

import { getDateString } from "@/lib/utils";

/**
 * Initialize a new daily game for a user with the given ruleset and word length.
 *
 * Create a fresh game record for today's date with default values.
 * Use 'onConflictDoNothing()' to avoid overwriting existing games for the same user/ruleset/wordLength combination.
 *
 * @param userId - The ID of the user starting the game.
 * @param ruleset - The ruleset to use (NORMAL, STRICT, or HARDCORE).
 * @param wordLength - The length of the target word.
 * @returns The newly created game object.
 */
export async function initDailyGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
) {
  const newGame = {
    userId,
    ruleset,
    wordLength,
    date: getDateString({ format: "database" }),
    gameState: GameState.PLAYING,
    keyStatuses: {},
    minimumLetterCounts: {},
    lockedPositions: {},
    guesses: [],
  };
  await database.insert(dailyGames).values(newGame).onConflictDoNothing();
  return newGame;
}

/**
 * Retrive the current daily game or create a new one if none exists for today.
 *
 * Query the database for an existing game matching the user, ruleset, and word length.
 *
 * If found and the date matches today, return the existing game.
 * If not found or the game is outdated, initialize a new game for today via {@link initDailyGame}.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve or create.
 * @param wordLength - The word length to retrieve or create.
 * @returns Object containing:
 *     - game: The current or newly created game.
 *     - isNewGame: Whether a new game was created (due to new day or first time).
 *     - wasIncomplete: Whether the previous day's game was left incomplete (null if isNewGame is false).
 */
export async function getDailyGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
) {
  const existingGame = await database
    .select()
    .from(dailyGames)
    .where(
      and(
        eq(dailyGames.userId, userId),
        eq(dailyGames.ruleset, ruleset),
        eq(dailyGames.wordLength, wordLength),
      ),
    )
    .limit(1);

  const [game] = existingGame;
  const todayDateString = getDateString({ format: "database" });

  // No game exists or game is from a previous day, create a new game.
  if (!game || game.date !== todayDateString) {
    const wasIncomplete = game?.gameState === GameState.PLAYING;
    const newGame = await initDailyGame(userId, ruleset, wordLength);

    return { game: newGame, isNewGame: true, wasIncomplete };
  }

  return { game, isNewGame: false, wasIncomplete: null };
}
