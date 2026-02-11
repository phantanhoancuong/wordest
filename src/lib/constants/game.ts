/** Number of attempts a player has per game */
export const ATTEMPTS = 6;

/** Used to determine the state and result of the game. */
export enum GameState {
  PLAYING = "playing",
  WON = "won",
  LOST = "lost",
}

/** Used to determine the game's ruleset (difficulty level) of the game. */
export enum Ruleset {
  NORMAL = "normal",
  STRICT = "strict",
  HARDCORE = "hardcore",
}

// Supported word lengths for the game.
export enum WordLength {
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
}

// Supported game sessions.
export enum SessionType {
  DAILY = "daily",
  PRACTICE = "practice",
}
