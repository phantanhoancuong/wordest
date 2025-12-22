"use client";

import { createContext, useContext } from "react";

import { AnimationSpeed } from "@/lib/constants";

import { useSettings } from "@/hooks/useSettings";

/**
 * Shape of the settings context.
 */
interface SettingsContextType {
  animationSpeed: {
    value: AnimationSpeed;
    setValue: (v: AnimationSpeed) => void;
  };
  volume: {
    value: number;
    setValue: (v: number) => void;
  };
  isMuted: {
    value: boolean;
    setValue: (v: boolean) => void;
  };
}

/**
 * React context for global game settings.
 */
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

/**
 * Hook to access the settings context.
 *
 * Must be used within a {@link SettingsProvider}.
 *
 * @throws Error if used outside the provider.
 * @returns The current settings and setter functions.
 */
export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider."
    );
  }

  return context;
};

/**
 * Props for {@link SettingsProvider}.
 */
interface SettingsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for global game settings.
 */
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const settings = useSettings();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
