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
