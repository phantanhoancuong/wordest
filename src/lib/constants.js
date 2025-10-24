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
 * Duration of the bounce anmation for cells, in milliseconds.
 *
 * @type {number}
 */
export const BOUNCE_ANIMATION_DURATION = 100;

/**
 * Enum for cell statuses in the grid.
 *
 * Represents the visual feedback for each letter in a guess.
 *
 * @enum {string}
 */
export const CellStatus = {
  /** Default, unguessed cell */
  DEFAULT: "default",
  /** Correct letter in correct position */
  CORRECT: "correct",
  /** Correct letter in wrong position */
  PRESENT: "present",
  /** Letter is absent from the word */
  ABSENT: "absent",
};

/**
 * Enum for cell animations.
 *
 * Controls how a cell animates when updated.
 *
 * @enum {string}
 */
export const CellAnimation = {
  NONE: "none",
  BOUNCE: "bounce",
  SHAKE: "shake",
};
