import {
  AnimationSpeed,
  DefaultSettings,
  GameMode,
  LocalStorageKeys,
  Theme,
  WordLength,
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
  const [gameMode, setGameMode] = useLocalStorage<GameMode>(
    LocalStorageKeys.GAME_MODE,
    DefaultSettings.GAME_MODE
  );
  const [wordLength, setWordLength] = useLocalStorage<WordLength>(
    LocalStorageKeys.WORD_LENGTH,
    DefaultSettings.WORD_LENGTH
  );
  const [theme, setTheme] = useLocalStorage<Theme>(
    LocalStorageKeys.THEME,
    DefaultSettings.THEME
  );

  const resetSettings = () => {
    setAnimationSpeed(DefaultSettings.ANIMATION_SPEED);
    setVolume(DefaultSettings.VOLUME);
    setIsMuted(DefaultSettings.IS_MUTED);
    setGameMode(DefaultSettings.GAME_MODE);
    setWordLength(DefaultSettings.WORD_LENGTH);
    setTheme(DefaultSettings.THEME);
  };

  return {
    animationSpeed: { value: animationSpeed, setValue: setAnimationSpeed },
    volume: { value: volume, setValue: setVolume },
    isMuted: { value: isMuted, setValue: setIsMuted },
    gameMode: { value: gameMode, setValue: setGameMode },
    wordLength: { value: wordLength, setValue: setWordLength },
    theme: { value: theme, setValue: setTheme },
    resetSettings,
  };
};
