"use client";

import { useEffect } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { Theme } from "@/lib/constants";

/**
 * Client-only component responsible for resolving and applying the application's active color theme.
 *
 * - Read the browser's 'prefers-color-scheme' media query and applies the resolved theme to the <html> element via the 'data-theme' attribute.
 * - React to live OS / browser theme changes while the app is running.
 * - Expose the color accessibility mode via "data-color-access".
 */
const ThemeProvider = () => {
  const { theme, colorAccess } = useSettingsContext();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    /** Resolve the effective theme (system vs explicit) and apply it to the <html> dataset. */
    const applyTheme = (): void => {
      const resolvedTheme =
        theme.value === Theme.SYSTEM
          ? media.matches
            ? Theme.DARK
            : Theme.LIGHT
          : theme.value;

      // Expose via a data attribute.
      root.dataset.theme = resolvedTheme;
      root.dataset.colorAccess = colorAccess.value ? "on" : "off";
    };
    applyTheme();

    // Listens for OS / browser theme changes when in "system" mode.
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme.value, colorAccess.value]);

  // Does not render UI.
  return null;
};

export default ThemeProvider;
