import { dailyGames, playerStats, practiceGames } from "@/lib/database/schema";
import { type ExtractTablesWithRelations } from "drizzle-orm";
import { type SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { type ResultSet } from "@libsql/client";
import * as schema from "@/lib/database/schema";
import { database } from "@/lib/database/client";

export type DailyGame = typeof dailyGames.$inferSelect;
export type PlayerStats = typeof playerStats.$inferSelect;
export type PracticeGame = typeof practiceGames.$inferSelect;
export type TX = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type DB = typeof database | TX;
