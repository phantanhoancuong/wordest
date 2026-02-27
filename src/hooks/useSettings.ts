"use client";

import {
  SETTINGS_KEY,
  AnimationSpeed,
  DefaultSettings,
  Ruleset,
  Settings,
  Theme,
  WordLength,
} from "@/lib/constants";

import { UseSettingsReturn } from "@/types/useSettingsReturn.types";

import { useLocalStorage } from "@/hooks";

/**
 * Hook to manage user-configurable game settings.
 *
 * Persists settings to localStorage and keeps React state in sync.
 * Provides both the current value and a setter for each setting.
 *
 * @returns An object to deal with animation speed, volume value, and whether or not the volume is muted.
 */
export const useSettings = (): UseSettingsReturn => {
  // Persisted settings state, backed by localStorage.
  const [settings, setSettings] = useLocalStorage<Settings>(
    SETTINGS_KEY,
    DefaultSettings,
  );

  // Updates a single setting key.
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Resets all settings back to their default values.
  const resetSettings = () => {
    setSettings(DefaultSettings);
  };

  return {
    animationSpeed: {
      value: settings.animationSpeed,
      setValue: (v: AnimationSpeed) => set("animationSpeed", v),
    },
    volume: {
      value: settings.volume,
      setValue: (v: number) => set("volume", v),
    },
    isMuted: {
      value: settings.isMuted,
      setValue: (v: boolean) => set("isMuted", v),
    },
    ruleset: {
      value: settings.ruleset,
      setValue: (v: Ruleset) => set("ruleset", v),
    },
    wordLength: {
      value: settings.wordLength,
      setValue: (v: WordLength) => set("wordLength", v),
    },
    theme: { value: settings.theme, setValue: (v: Theme) => set("theme", v) },
    showReferenceGrid: {
      value: settings.showReferenceGrid,
      setValue: (v: boolean) => set("showReferenceGrid", v),
    },
    showKeyStatuses: {
      value: settings.showKeyStatuses,
      setValue: (v: boolean) => set("showKeyStatuses", v),
    },
    colorAccess: {
      value: settings.colorAccess,
      setValue: (v: boolean) => set("colorAccess", v),
    },
    resetSettings,
  };
};
