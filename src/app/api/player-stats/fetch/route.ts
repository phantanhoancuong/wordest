import { headers } from "next/headers";

import { database } from "@/lib/database/client";
import { findPlayerStats } from "@/lib/database/queries/playerStats";

import { auth } from "@/lib/auth/auth";

/**
 * POST /api/player-stats/fetch
 *
 * Fetch a player's stats for a given session type, ruleset, and word length.
 *
 * @returns 200 with { data: PlayerStats | null } on success.
 * @returns 400 if ruleset or wordLength are missing from the request body.
 * @returns 500 if the session is missing or an unexpected error occurs.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Anonymous auth ensures every user has a session.
    // A missing session here means something went wrong with auth setup.
    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

    const { sessionType, ruleset, wordLength } = await req.json();

    if (!ruleset || !wordLength) {
      console.error("Malformed request.");
      return Response.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const stats = await findPlayerStats(database, {
      userId: session.user.id,
      sessionType,
      ruleset,
      wordLength,
    });

    return Response.json({
      data: stats,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
