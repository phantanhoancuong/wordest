import {
  AnimationSpeed,
  DefaultSettings,
  LocalStorageKeys,
} from "@/lib/constants";

import { useLocalStorage } from "./useLocalStorage";

/**
 * Hook to manage user-configurable game settings.
 *
 * Persists settings to localStorage and keeps React state in sync.
 * Provides both the current value and a setter for each setting.
 *
 * @returns An object to deal with animation speed, volume value, and whether or not the volume is muted.
 */
export const useSettings = () => {
  const [animationSpeed, setAnimationSpeed] = useLocalStorage<AnimationSpeed>(
    LocalStorageKeys.ANIMATION_SPEED,
    DefaultSettings.ANIMATION_SPEED
  );
  const [volume, setVolume] = useLocalStorage<number>(
    LocalStorageKeys.VOLUME,
    DefaultSettings.VOLUME
  );
  const [isMuted, setIsMuted] = useLocalStorage<boolean>(
    LocalStorageKeys.IS_MUTED,
    DefaultSettings.IS_MUTED
  );

  return {
    animationSpeed: { value: animationSpeed, setValue: setAnimationSpeed },
    volume: { value: volume, setValue: setVolume },
    isMuted: { value: isMuted, setValue: setIsMuted },
  };
};
