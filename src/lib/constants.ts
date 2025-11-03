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

/** Animation timing configuration */
export interface AnimationTiming {
  bounceDelay: number;
  bounceDuration: number;
  shakeDelay: number;
  shakeDuration: number;
  bounceRevealDelay: number;
  bounceRevealDuration: number;
}

/** Default timing values for animations (in seconds) */
export const animationTiming: AnimationTiming = {
  bounceDelay: 0.3,
  bounceDuration: 0.3,
  shakeDelay: 0,
  shakeDuration: 0.3,
  bounceRevealDelay: 0.3,
  bounceRevealDuration: 0.3,
};
