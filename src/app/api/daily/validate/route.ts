import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { WORD_LISTS } from "@/types/wordList.types";
import { ATTEMPTS, GameState, Ruleset, WordLength } from "@/lib/constants";
import { getDailyGame } from "@/lib/database/queries/dailyGames";
import {
  checkValidStrictGuess,
  getDateString,
  getDaysSinceEpoch,
} from "@/lib/utils";
import { generateDailyWord } from "@/lib/words/generateWord";

import { evaluateGuess } from "@/lib/utils";
import { updateStrictConstraints } from "@/lib/utils";
import { database } from "@/lib/database/client";
import { dailyGames } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

async function validateAndUpdate(
  userId: string,
  ruleset: Ruleset,
  wordLength: WordLength,
  guess: string,
  isStrict: boolean,
) {
  const { game, isNewGame, wasIncomplete } = await getDailyGame(
    userId,
    ruleset,
    wordLength,
  );

  if (isNewGame) {
    let message = null;
    if (wasIncomplete)
      message = `New game fetched for ${getDateString({ format: "display" })}`;
    return { isValid: false, message, data: null };
  }

  if (isStrict) {
    const { isValid, message } = checkValidStrictGuess(
      guess,
      game.lockedPositions,
      game.minimumLetterCounts,
    );
    if (!isValid) return { isValid: false, message, data: null };
  }

  const targetWord = generateDailyWord(ruleset, wordLength);

  const statuses = evaluateGuess(guess, targetWord);
  const updatedGuesses = [...game.guesses, guess];

  const isWon = guess === targetWord;
  const isLost = !isWon && updatedGuesses.length >= ATTEMPTS;
  const updatedGameState = isWon
    ? GameState.WON
    : isLost
      ? GameState.LOST
      : GameState.PLAYING;

  const strictUpdates = isStrict
    ? updateStrictConstraints(
        guess,
        statuses,
        game.minimumLetterCounts,
        game.lockedPositions,
      )
    : null;

  await database
    .update(dailyGames)
    .set({
      guesses: updatedGuesses,
      gameState: updatedGameState,
      ...(strictUpdates ?? {}),
    })
    .where(
      and(
        eq(dailyGames.userId, userId),
        eq(dailyGames.ruleset, ruleset),
        eq(dailyGames.wordLength, wordLength),
      ),
    );

  return {
    isValid: true,
    message: null,
    data: {
      statuses,
      gameState: updatedGameState,
      lockedPositions: strictUpdates?.lockedPositions ?? null,
      minimumLetterCounts: strictUpdates?.minimumLetterCounts ?? null,
      targetWord: isWon || isLost ? targetWord : null,
    },
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Anonymous auth ensures every user has a session.
    // A missing session here means something went wrong with the auth setup.
    if (!session) {
      console.error("No session found despite anonymous auth being enabled.");
      return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

    const { ruleset, wordLength, guess, isStrict } = await req.json();

    // Checking for a malformed request from the client.
    const { answers, allowed } = WORD_LISTS[guess.length];
    if (!answers || !allowed) {
      console.error(`Invalid word length received: ${guess.length}`);
      return Response.json({ error: "INVALID_WORD_LENGTH" }, { status: 400 });
    }

    // Check the guess against both the answer list and allowed list.
    const isInWordList = answers.includes(guess) || allowed.includes(guess);
    if (!isInWordList)
      return Response.json({ message: "Word not allowed." }, { status: 422 });

    const result = await validateAndUpdate(
      session.user.id,
      ruleset,
      wordLength,
      guess,
      isStrict,
    );

    if (!result.isValid)
      return Response.json({ message: result.message }, { status: 422 });

    return Response.json({ data: result.data });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
