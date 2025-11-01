/**
 * Number of attempts a player has per game.
 *
 * @type {number}
 */
export const ATTEMPTS = 6;

/**
 * Number of letters in each target word.
 *
 * @type {number}
 */
export const WORD_LENGTH = 5;

/**
 * Maximum number of toasts displayed at once.
 *
 * @type {number}
 */
export const MAX_TOASTS = 3;

/**
 * Configuration object defining timing values (in seconds) for cell animations.
 *
 * @typedef {Object} animationTiming
 * @property {number} bounceDelay - Delay before the bounce animation starts.
 * @property {number} bounceDuration - Duration of the bounce animation.
 * @property {number} shakeDelay - Delay before the shake animation starts.
 * @property {number} shakeDuration - Duration of the shake animation.
 * @property {number} bounceRevealDelay - Delay before the bounce-reveal animation starts.
 * @property {number} bounceRevealDuration - Duration of the bounce-reveal animation.
 */

/**
 * Timing values for cell animations, in seconds.
 *
 * @type {animationTiming}
 */
export const animationTiming = {
  bounceDelay: 0.3,
  bounceDuration: 0.3,
  shakeDelay: 0,
  shakeDuration: 0.3,
  bounceRevealDelay: 0.3,
  bounceRevealDuration: 0.3,
};

/**
 * Enum for cell statuses in the grid.
 *
 * Represents the visual feedback for each letter in a guess.
 *
 * @enum {string}
 */
export const CellStatus = {
  /** Default, unguessed cell. */
  DEFAULT: "default",
  /** Correct letter in the correct position. */
  CORRECT: "correct",
  /** Correct letter but in the wrong position. */
  PRESENT: "present",
  /** Letter is not in the target word. */
  ABSENT: "absent",
  /** Hidden or transparent cell (e.g., during transitions). */
  HIDDEN: "hidden",
};
/**
 * Enum for cell animations.
 *
 * Defines available animation states for grid cells.
 *
 * @enum {string}
 */
export const CellAnimation = {
  /** No animation. */
  NONE: "none",
  /** Cell bounces up and down. */
  BOUNCE: "bounce",
  /** Cell shakes horizontally to indicate an invalid guess. */
  SHAKE: "shake",
  /** Cell bounces and reveals a hidden character. */
  BOUNCE_REVEAL: "bounce-reveal",
};
