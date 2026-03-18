import { dailyGames, practiceGames } from "@/lib/database/schema";

export type DailyGame = typeof dailyGames.$inferSelect;

export type PracticeGame = typeof practiceGames.$inferSelect;
