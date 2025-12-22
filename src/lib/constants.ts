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

/**
 * Used to determine the animation speed settings of the game.
 */
export enum AnimationSpeed {
  FAST = "fast",
  NORMAL = "normal",
  SLOW = "slow",
}

export const AnimationSpeedMultiplier: Record<AnimationSpeed, number> = {
  [AnimationSpeed.FAST]: 0.75,
  [AnimationSpeed.NORMAL]: 1,
  [AnimationSpeed.SLOW]: 1.5,
};

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

// Keys and default values used for persisted user settings.
export const LocalStorageKeys = {
  ANIMATION_SPEED: "wordest:animationSpeed",
  VOLUME: "wordest:volume",
  IS_MUTED: "wordest:isMuted",
};

export const DefaultSettings = {
  ANIMATION_SPEED: AnimationSpeed.NORMAL,
  VOLUME: 0.5,
  IS_MUTED: false,
};

// Default volume applied when unmuting from a zero-volume state.
export const DEFAULT_UNMUTE_VOLUME = 0.33;
