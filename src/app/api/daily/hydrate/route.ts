import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";

import { database } from "@/lib/database/client";

import { GameState, SessionType } from "@/lib/constants";

import {
  createDailyGame,
  findDailyGame,
} from "@/lib/database/queries/dailyGames";
import { recordExpiredGame } from "@/lib/database/queries/playerStats";
import { evaluateGuess, getDateString } from "@/lib/utils";
import { generateDailyWord } from "@/lib/words/generateWord";

/**
 * POST /api/daily/hydrate
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
    // A missing session here means something went wrong with auth setup.
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

    let game = await findDailyGame(session.user.id, ruleset, wordLength);

    // If no game is found, return null.
    if (game === null)
      return Response.json({
        data: null,
        message: `New game fetched for ${getDateString({ format: "display" })}`,
      });

    // If the game is from a previous day, create a new game.
    if (game.date !== getDateString({ format: "database" })) {
      await database.transaction(async (tx) => {
        if (game.gameState === GameState.PLAYING)
          await recordExpiredGame(tx, {
            userId: session.user.id,
            sessionType: SessionType.DAILY,
            ruleset,
            wordLength,
          });
      });
      game = await createDailyGame(session.user.id, ruleset, wordLength);
    }

    const targetWord = generateDailyWord(ruleset, wordLength);

    const allStatuses = game.guesses.map((guess: string) =>
      evaluateGuess(guess, targetWord),
    );

    return Response.json({
      data: {
        allStatuses,
        guesses: game.guesses,
        gameState: game.gameState,
        lockedPositions: game.lockedPositions,
        minimumLetterCounts: game.minimumLetterCounts,
        targetWord: game.gameState !== GameState.PLAYING ? targetWord : null,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
