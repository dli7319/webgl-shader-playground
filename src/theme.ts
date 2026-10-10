export type ThemeMode = "light" | "dark";

export const THEME_BACKGROUNDS: Record<ThemeMode, string> = {
  light: "#f5f5f7",
  dark: "#1c1c1e",
};

/** Applies the mode to the document (drives the CSS custom properties). */
export function applyThemeToDocument(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
  document.body.style.backgroundColor = THEME_BACKGROUNDS[mode];
}
