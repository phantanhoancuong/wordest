"use client";

import { useEffect } from "react";

import { Theme } from "@/lib/constants";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

/**
 * Client-only component responsible for resolving and applying the application's active color theme.
 * - Read the browser's "prefers-color-theme" media query, apply the resolved theme to the <html> element via "data-theme".
 * - React to live OS / browser theme changes while the app is running.
 */
const ThemeProvider = () => {
  const { theme } = useSettingsContext();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme =
        theme.value === Theme.SYSTEM
          ? media.matches
            ? Theme.DARK
            : Theme.LIGHT
          : theme.value;

      // Expose via a data attribute.
      root.dataset.theme = resolvedTheme;
    };

    applyTheme();

    // Listens for OS / browser theme changes when in "system" mode.
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme.value]);

  // Does not render UI.
  return null;
};

export default ThemeProvider;
