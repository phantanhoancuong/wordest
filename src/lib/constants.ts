/** Number of attempts a player has per game */
export const ATTEMPTS = 6;

/** Number of letters in each target word */
export const WORD_LENGTH = 5;

/** Maximum number of toasts displayed at once */
export const MAX_TOASTS = 3;

/** Enum for cell statuses */
export enum CellStatus {
  /** Default, unguessed cell */
  DEFAULT = "default",
  /** Correct letter in the correct position */
  CORRECT = "correct",
  /** Correct letter but in the wrong position */
  PRESENT = "present",
  /** Letter is not in the target word */
  ABSENT = "absent",
  /** Hidden or transparent cell (e.g., during transitions) */
  HIDDEN = "hidden",
  /** Cell styling for when the user loses the game. */
  WRONG = "wrong",
}

/** Enum for cell animations */
export enum CellAnimation {
  /** No animation */
  NONE = "none",
  /** Cell bounces up and down */
  BOUNCE = "bounce",
  /** Cell shakes horizontally to indicate an invalid guess */
  SHAKE = "shake",
  /** Cell bounces and reveals a hidden character */
  BOUNCE_REVEAL = "bounce-reveal",
}

/**
 * Used to determine the state and result of the game.
 */
export enum GameState {
  PLAYING = "playing",
  WON = "won",
  LOST = "lost",
}

/** Animation timing configuration */
interface AnimationTypeTiming {
  delay: number;
  motion: number;
  color: number;
}

export interface AnimationTiming {
  bounce: AnimationTypeTiming;
  shake: AnimationTypeTiming;
}

/** Default timing values for animations (in seconds) */
export const animationTiming: AnimationTiming = {
  bounce: {
    delay: 0.25,
    motion: 0.25,
    color: 0.25,
  },
  shake: {
    delay: 0.3,
    motion: 0.3,
    color: 0.3,
  },
};
