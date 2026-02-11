/** Used to determine the animation speed settings of the game. */
export enum AnimationSpeed {
  FAST = "fast",
  NORMAL = "normal",
  SLOW = "slow",
  INSTANT = "instant",
}

/** Multiplier applied to base animation timings for each animation speed. */
export const AnimationSpeedMultiplier: Record<AnimationSpeed, number> = {
  [AnimationSpeed.FAST]: 0.75,
  [AnimationSpeed.NORMAL]: 1,
  [AnimationSpeed.SLOW]: 1.5,
  [AnimationSpeed.INSTANT]: 0,
};

/** Timing configurations for a single animation type (in seconds). */
interface AnimationTypeTiming {
  delay: number;
  motion: number;
  color: number;
}

/** Collection of timing configurations for supported animation types. */
export interface AnimationTiming {
  bounce: AnimationTypeTiming;
  shake: AnimationTypeTiming;
}

/** Default timing values for animations (in seconds). */
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
