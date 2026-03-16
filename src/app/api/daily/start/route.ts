import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { getDailyGame } from "@/lib/database/queries/dailyGames";
import { evaluateGuess } from "@/lib/utils";
import { generateDailyWord } from "@/lib/words/generateWord";
import { getDateString } from "@/lib/utils";
import { GameState } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

    const { ruleset, wordLength } = await req.json();

    // Checking for a alformed request from the client.
    if (!ruleset || !wordLength) {
      console.error("Malformed request.");
      return Response.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const { game, isNewGame, wasIncomplete } = await getDailyGame(
      session.user.id,
      ruleset,
      wordLength,
    );

    let message = null;
    if (isNewGame && wasIncomplete)
      message = `New game fetched for ${getDateString({ format: "display" })}`;

    const targetWord = generateDailyWord(ruleset, wordLength);

    const allStatuses = game.guesses.map((guess: string) =>
      evaluateGuess(guess, targetWord),
    );

    return Response.json({
      message,
      allStatuses,
      guesses: game.guesses,
      gameState: game.gameState,
      lockedPositions: game.lockedPositions,
      minimumLetterCounts: game.minimumLetterCounts,
      targetWord: game.gameState !== GameState.PLAYING ? targetWord : null,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
