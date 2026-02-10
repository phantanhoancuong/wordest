import { AnimationSpeed, Ruleset, Theme, WordLength } from "@/lib/constants";

type Field<T> = {
  value: T;
  setValue: (v: T) => void;
};

export interface UseSettingsReturn {
  animationSpeed: Field<AnimationSpeed>;
  volume: Field<number>;
  isMuted: Field<boolean>;
  ruleset: Field<Ruleset>;
  wordLength: Field<WordLength>;
  theme: Field<Theme>;
  showReferenceGrid: Field<boolean>;
  showKeyStatuses: Field<boolean>;
  colorAccess: Field<boolean>;
  resetSettings: () => void;
}
