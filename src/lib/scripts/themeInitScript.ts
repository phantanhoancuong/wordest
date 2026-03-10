export const themeInitScript = `
(function () {
  try {
    const d = document.documentElement;

    const storedTheme = localStorage.getItem("theme");
    const storedColorAccess = localStorage.getItem("colorAccess");

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme =
      !storedTheme || storedTheme === "system"
        ? (prefersDark ? "dark" : "light")
        : storedTheme;

    d.dataset.theme = theme;
    d.dataset.colorAccess = storedColorAccess === "true" ? "on" : "off";
  } catch {}
})();
`;
