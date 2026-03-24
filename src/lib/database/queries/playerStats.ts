import "server-only";

import { and, eq } from "drizzle-orm";

import { playerStats } from "@/lib/database/schema";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";

import { PlayerStats, DB } from "@/types/database.types";

type StatsFilter = {
  userId: string;
  sessionType: SessionType;
  ruleset: Ruleset;
  wordLength: WordLength;
};

function statsWhereClause(filter: StatsFilter) {
  return and(
    eq(playerStats.userId, filter.userId),
    eq(playerStats.sessionType, filter.sessionType),
    eq(playerStats.ruleset, filter.ruleset),
    eq(playerStats.wordLength, filter.wordLength),
  );
}

/**
 * Find a player's stats row for a given session type, ruleset, and word length.
 *
 * @param db - Database client or active transaction.
 * @param filter - The userId, sessionType, ruleset, and wordLength to look up.
 * @returns The matching {@link PlayerStats} row, or null if none exists.
 */
export async function findPlayerStats(db: DB, filter: StatsFilter) {
  const [stats] = await db
    .select()
    .from(playerStats)
    .where(statsWhereClause(filter))
    .limit(1);

  return stats ?? null;
}

/**
 * Insert or update a player's stats when a game ends.
 *
 * If no stats row exists, create one with initial values.
 * If a row exists, increment counters and update streak and guess distribution.
 * @param tx - Database client or active transaction.
 * @param filter - The userId, sessionType, ruleset, and wordLength to upsert for.
 * @param isWon - Whether the player won the game.
 * @param guessCount - Number of guesses the player used.
 */
export async function upsertPlayerStats(
  db: DB,
  filter: StatsFilter,
  isWon: boolean,
  guessCount: number,
) {
  const now = new Date();
  const existing = await findPlayerStats(db, filter);
  if (existing === null) {
    const guessDistribution = [0, 0, 0, 0, 0, 0];
    if (isWon) guessDistribution[guessCount - 1] = 1;

    await db.insert(playerStats).values({
      ...filter,
      gamesPlayed: 1,
      gamesWon: isWon ? 1 : 0,
      gamesLost: isWon ? 0 : 1,
      currentStreak: isWon ? 1 : 0,
      maxStreak: isWon ? 1 : 0,
      guessDistribution,
    });
  } else {
    const newStreak = isWon ? existing.currentStreak + 1 : 0;
    const guessDistribution = [...existing.guessDistribution];
    if (isWon) guessDistribution[guessCount - 1] += 1;

    await db
      .update(playerStats)
      .set({
        gamesPlayed: existing.gamesPlayed + 1,
        gamesWon: existing.gamesWon + (isWon ? 1 : 0),
        gamesLost: existing.gamesLost + (isWon ? 0 : 1),
        currentStreak: newStreak,
        maxStreak: Math.max(existing.maxStreak, newStreak),
        guessDistribution,
        lastCompleted: now,
        updatedAt: now,
      })
      .where(statsWhereClause(filter));
  }
}

/**
 * Record a forfeit loss ofr a game that expired before the player finished.
 *
 * Increment games played and lost, reset the current streak, and update lastCompleted.
 *
 * @param db - Database client or active transaction.
 * @param filter - The userId, sessionType, ruleset, and wordLength to update for.
 */
export async function recordExpiredGame(db: DB, filter: StatsFilter) {
  const now = new Date();
  const existing = await findPlayerStats(db, filter);

  if (existing === null)
    await db.insert(playerStats).values({
      ...filter,
      gamesPlayed: 1,
      gamesLost: 1,
    });
  else
    await db
      .update(playerStats)
      .set({
        gamesPlayed: existing.gamesPlayed + 1,
        gamesLost: existing.gamesLost + 1,
        currentStreak: 0,
        lastCompleted: now,
        updatedAt: now,
      })
      .where(statsWhereClause(filter));
}

/**
 * Delete all stats rows for a given user.
 *
 * @param db - Databas client or active transaction.
 * @param userId - The user whose stats to delete.
 */
export async function deleteAllPlayerStats(db: DB, userId: string) {
  await db.delete(playerStats).where(eq(playerStats.userId, userId));
}
