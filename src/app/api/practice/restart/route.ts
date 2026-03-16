import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import {
  getPracticeGame,
  restartPracticeGame,
} from "@/lib/database/queries/practiceGames";
import { GameState } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Anonymous auth ensures every user has a session.
    // A missing session here means something went wrong with the auth setup.
    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

    const { ruleset, wordLength } = await req.json();

    // Checking for a malformed request from the client.
    if (!ruleset || !wordLength) {
      console.error("Malformed request.");
      return Response.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const game = await getPracticeGame(session.user.id, ruleset, wordLength);

    if (game.gameState === GameState.PLAYING)
      return Response.json(
        { message: "Game's not done. Cannot restart." },
        { status: 422 },
      );

    const newGame = await restartPracticeGame(
      session.user.id,
      ruleset,
      wordLength,
    );

    return Response.json({
      allStatuses: [],
      guesses: [],
      gameState: newGame.gameState,
      lockedPositions: newGame.lockedPositions,
      minimumLetterCounts: newGame.minimumLetterCounts,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
