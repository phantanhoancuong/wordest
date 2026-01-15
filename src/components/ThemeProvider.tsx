"use client";

import { useEffect } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

const ThemeProvider = () => {
  const { theme } = useSettingsContext();

  useEffect(() => {
    const root = document.documentElement;
    let themeValue = theme.value;
    root.dataset.theme = themeValue;
  }, [theme.value]);

  return null;
};

export default ThemeProvider;
