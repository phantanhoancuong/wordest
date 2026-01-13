import { create } from "zustand";

type SettingsUIStore = {
  isGeneralOpen: boolean;
  isGameplayOpen: boolean;
  setIsGeneralOpen: (isOpen: boolean) => void;
  setIsGameplayOpen: (isOpen: boolean) => void;
};

export const useSettingsUIStore = create<SettingsUIStore>((set) => ({
  isGeneralOpen: true,
  isGameplayOpen: true,
  setIsGeneralOpen: (isOpen) => set({ isGeneralOpen: isOpen }),
  setIsGameplayOpen: (isOpen) => set({ isGameplayOpen: isOpen }),
}));
