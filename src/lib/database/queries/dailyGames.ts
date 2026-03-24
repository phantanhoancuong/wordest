import "server-only";

import { and, eq } from "drizzle-orm";

import { database } from "@/lib/database/client";
import { dailyGames } from "@/lib/database/schema";

import { GameState, Ruleset, WordLength } from "@/lib/constants";

import { DailyGame } from "@/types/database.types";

import { getDateString } from "@/lib/utils";

/**
 * Initialize a new daily game for a user with the given ruleset and word length.
 *
 * Create a fresh game record with today's date and default values.
 * If there already exists a game for the same user + ruleset + word length then overwrite the game with the new default values.
 *
 * @param userId - The ID of the user starting the game.
 * @param ruleset - The ruleset to use (NORMAL, STRICT, or HARDCORE).
 * @param wordLength - The length of the target word.
 * @returns The newly created game object.
 */
export async function createDailyGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<DailyGame> {
  const date = getDateString({ format: "display" });

  const [game] = await database
    .insert(dailyGames)
    .values({
      userId,
      ruleset,
      wordLength,
      date,
    })
    .onConflictDoUpdate({
      target: [dailyGames.userId, dailyGames.ruleset, dailyGames.wordLength],
      set: {
        date,
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
 * Retrieve an existing daily game. If none exists, return null.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve.
 * @param wordLength - The word length to retrieve.
 * @returns The existing game object or null if none exists.
 */
export async function findDailyGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
): Promise<DailyGame | null> {
  const [game] = await database
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

  return game ?? null;
}

/**
 * Retrieve the current daily game or create a new one if none exists for today.
 *
 * Query the database for an existing game matching the user, ruleset, and word length.
 *
 * If found and the date matches today, return the existing game.
 * If not found or the game is outdated, initialize a new game for today via {@link createDailyGame}.
 *
 * @param userId - The ID of the user.
 * @param ruleset - The ruleset to retrieve or create.
 * @param wordLength - The word length to retrieve or create.
 * @returns Object containing:
 *     - game: The current or newly created game.
 *     - isNewGame: Whether a new game was created (due to new day or first time).
 *     - wasIncomplete: Whether the previous day's game was left incomplete (null if isNewGame is false).
 */
export async function findOrCreateDailyGame(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
) {
  const game = await findDailyGame(userId, ruleset, wordLength);

  // No game exists or game is from a previous day, create a new game.
  if (!game || game.date !== getDateString({ format: "display" }))
    return {
      game: await createDailyGame(userId, ruleset, wordLength),
      isNewGame: true,
      wasIncomplete: game?.gameState === GameState.PLAYING,
    };

  return { game, isNewGame: false, wasIncomplete: null };
}
