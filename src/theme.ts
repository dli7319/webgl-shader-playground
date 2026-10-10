export type ThemeMode = "light" | "dark";

export const THEME_BACKGROUNDS: Record<ThemeMode, string> = {
  light: "#f5f2e9",
  dark: "#101010",
};

/** Applies the mode to the document (drives the CSS custom properties). */
export function applyThemeToDocument(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
  document.body.style.backgroundColor = THEME_BACKGROUNDS[mode];
}
