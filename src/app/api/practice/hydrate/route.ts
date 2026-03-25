import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { findPracticeGame } from "@/lib/database/queries/practiceGames";
import { evaluateGuess } from "@/lib/utils";
import { GameState } from "@/lib/constants";

/**
 * POST /api/practice/hydrate
 *
 * Hydrate the game states when a new user/ruleset/word length combination is selected by fetching a stored game from the database.
 *
 * @returns '{ error }' with the appropriate status code if failed internally. If it failed because of the player's action,
 * a message will also be included. Return '{ data }' containing game states to hydrate, if no existing game is found 'data' is null.
 */
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

    const game = await findPracticeGame(session.user.id, ruleset, wordLength);

    // If no game is found, return null.
    if (game === null) return Response.json({ data: null });

    const allStatuses = game.guesses.map((guess: string) =>
      evaluateGuess(guess, game.targetWord),
    );

    return Response.json({
      data: {
        allStatuses,
        guesses: game.guesses,
        gameState: game.gameState,
        lockedPositions: game.lockedPositions,
        minimumLetterCounts: game.minimumLetterCounts,
        targetWord:
          game.gameState !== GameState.PLAYING ? game.targetWord : null,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
