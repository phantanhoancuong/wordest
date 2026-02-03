/** Number of attempts a player has per game */
export const ATTEMPTS = 6;

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
 * Used to determine the game's ruleset (difficulty level) of the game.
 */
export enum Ruleset {
  NORMAL = "normal",
  STRICT = "strict",
  HARDCORE = "hardcore",
}

/**
 * Used to determine the animation speed settings of the game.
 */
export enum AnimationSpeed {
  FAST = "fast",
  NORMAL = "normal",
  SLOW = "slow",
  INSTANT = "instant",
}

export const AnimationSpeedMultiplier: Record<AnimationSpeed, number> = {
  [AnimationSpeed.FAST]: 0.75,
  [AnimationSpeed.NORMAL]: 1,
  [AnimationSpeed.SLOW]: 1.5,
  [AnimationSpeed.INSTANT]: 0,
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

// Supported word lengths for the game.
export enum WordLength {
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
}

// Supported color themes for the game.
export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

// Default volume applied when unmuting from a zero-volume state.
export const DEFAULT_UNMUTE_VOLUME = 1 / 3;

// Visual variants for settings buttons.
export enum SettingsButtonVariant {
  DEFAULT = "default",
  // Destructive or dangerous action styling.
  DANGER = "danger",
}

// Support game sessions.
export enum SessionType {
  DAILY = "daily",
  PRACTICE = "practice",
}

// Shape of persisted user settings object.
export type Settings = {
  animationSpeed: AnimationSpeed;
  volume: number;
  isMuted: boolean;
  ruleset: Ruleset;
  wordLength: WordLength;
  theme: Theme;
  showReferenceGrid: boolean;
  showKeyStatuses: boolean;
  colorAccess: boolean;
};

// Local storage key used to presist user settings.
export const SETTINGS_KEY = "wordest:settings";

// Default settings used when no persisted settings are found.
export const DefaultSettings: Settings = {
  animationSpeed: AnimationSpeed.NORMAL,
  volume: 2 / 3,
  isMuted: false,
  ruleset: Ruleset.NORMAL,
  wordLength: WordLength.FIVE,
  theme: Theme.SYSTEM,
  showReferenceGrid: true,
  showKeyStatuses: true,
  colorAccess: false,
};
