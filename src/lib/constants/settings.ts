import { AnimationSpeed } from "./animation";
import { Ruleset, WordLength } from "./game";
import { Theme } from "./ui";

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

// Default volume applied when unmuting from a zero-volume state.
export const DEFAULT_UNMUTE_VOLUME = 1 / 3;
