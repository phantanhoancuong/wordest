import { create } from "zustand";

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
