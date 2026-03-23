import { ne, eq, and } from "drizzle-orm";
import { database } from "@/lib/database/client";
import { dailyGames } from "@/lib/database/schema";
import { GameState, Ruleset, SessionType, WordLength } from "@/lib/constants";
import { recordExpiredGame } from "@/lib/database/queries/playerStats";
import { getDateString } from "@/lib/utils";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const expiredGames = await database
      .select()
      .from(dailyGames)
      .where(
        and(
          ne(dailyGames.date, getDateString({ format: "display" })),
          eq(dailyGames.gameState, GameState.PLAYING),
        ),
      );

    await database.transaction(async (tx) => {
      for (const game of expiredGames) {
        await recordExpiredGame(tx, {
          userId: game.userId,
          sessionType: SessionType.DAILY,
          ruleset: game.ruleset as Ruleset,
          wordLength: game.wordLength as WordLength,
        });
      }

      return Response.json({ expired: expiredGames.length });
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
