import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";

import { GameState } from "@/lib/constants";

import {
  deletePracticeGame,
  findPracticeGame,
} from "@/lib/database/queries/practiceGames";

/**
 * POST /api/practice/restart
 *
 * Restart the practice game by removing its entry in the practice games table.
 *
 * A new game is not created until the player actually submits a new guess to not populate the table with unnecessary data.
 *
 * @returns '{ restart: boolean }' to show if the removal was successful; { error } with an a status code on failure.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Anonymous auth ensures every user has a session.
    // A missing session here means something went wrong with the auth setup.
    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json(
        { restart: false, error: "INTERNAL_SERVER_ERROR" },
        { status: 500 },
      );
    }

    const { ruleset, wordLength } = await req.json();

    // Checking for a malformed request from the client.
    if (!ruleset || !wordLength) {
      console.error("Malformed request.");
      return Response.json(
        { restart: false, error: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const game = await findPracticeGame(session.user.id, ruleset, wordLength);

    // If the game is null, it means it hasn't been finished.
    if (game === null || game.gameState === GameState.PLAYING)
      return Response.json(
        { restart: false, message: "Game's not done. Cannot restart." },
        { status: 422 },
      );

    await deletePracticeGame(session.user.id, ruleset, wordLength);
    return Response.json({
      restart: true,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
