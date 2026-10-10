import { createTheme, type Theme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export const THEME_BACKGROUNDS: Record<ThemeMode, string> = {
  light: "#ffffff",
  dark: "#141414",
};

/** Builds the MUI theme for the given mode. */
export function buildTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? { background: { default: THEME_BACKGROUNDS.dark, paper: "#262626" } }
        : {}),
    },
  });
}

/** Applies the mode to the document (drives the CSS custom properties). */
export function applyThemeToDocument(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
  document.body.style.backgroundColor = THEME_BACKGROUNDS[mode];
}
