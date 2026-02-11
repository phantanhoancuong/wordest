import { create } from "zustand";

/**
 * UI state for the Settings panel sections.
 *
 * Controls whether each settings category section is expanded or collapsed.
 */
type SettingsUIStore = {
  isGeneralOpen: boolean;
  isGameplayOpen: boolean;
  isDangerZoneOpen: boolean;
  isAccessOpen: boolean;
  setIsGeneralOpen: (isOpen: boolean) => void;
  setIsGameplayOpen: (isOpen: boolean) => void;
  setIsDangerZoneOpen: (isOpen: boolean) => void;
  setIsAccessOpen: (isOpen: boolean) => void;
};

/**
 * Zustand store for managing the open/closed state of Settings UI sections.
 *
 * All sections are open by default.
 */
export const useSettingsUIStore = create<SettingsUIStore>((set) => ({
  isGeneralOpen: true,
  isGameplayOpen: true,
  isDangerZoneOpen: true,
  isAccessOpen: true,
  setIsGeneralOpen: (isOpen) => set({ isGeneralOpen: isOpen }),
  setIsGameplayOpen: (isOpen) => set({ isGameplayOpen: isOpen }),
  setIsDangerZoneOpen: (isOpen) => set({ isDangerZoneOpen: isOpen }),
  setIsAccessOpen: (isOpen) => set({ isAccessOpen: isOpen }),
}));
