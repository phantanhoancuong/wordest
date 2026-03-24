"use client";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";

export const usePlayerStatsState = () => {
  /**
   * Fetch a player's stats for a given session type, ruleset, and word length.
   *
   * If not stats row exists for the combinations, returns a zeroed-out default object for display.
   *
   * @param sessionType - The session type to filter by.
   * @param ruleset - The ruleset to filter by.
   * @param wordLength - The word length to filter by.
   * @returns The player's stats, or default zero values if none exists.
   */
  const fetchPlayerStats = async (
    sessionType: SessionType,
    ruleset: Ruleset,
    wordLength: WordLength,
  ) => {
    const response = await fetch("/api/player-stats/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionType,
        ruleset: ruleset,
        wordLength: wordLength,
      }),
    });

    const { data } = await response.json();
    console.log(data);

    return (
      data ?? {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0],
        lastCompleted: null,
      }
    );
  };

  const resetPlayerStats = async () => {
    const reponse = await fetch("/api/player-stats/reset", { method: "POST" });
    const { success } = await reponse.json();
    return success ?? false;
  };

  return { fetchPlayerStats, resetPlayerStats };
};
