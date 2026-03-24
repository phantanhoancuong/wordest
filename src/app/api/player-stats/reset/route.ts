import { headers } from "next/headers";

import { database } from "@/lib/database/client";
import { deleteAllPlayerStats } from "@/lib/database/queries/playerStats";

import { auth } from "@/lib/auth/auth";

/**
 * POST /api/player-stats/reset
 *
 * Delete all stats rows for the authenticated user.
 *
 * @returns 200 with { success: true } on success.
 * @returns 500 if the session is missing or an unexpected error occurs.
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

    await deleteAllPlayerStats(database, session.user.id);

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
