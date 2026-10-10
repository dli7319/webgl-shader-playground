export type ThemeMode = "light" | "dark";

export interface Settings {
  themeMode: ThemeMode;
  autoRun: boolean;
  editorFontSize: number;
  wordWrap: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  themeMode: "light",
  autoRun: false,
  editorFontSize: 14,
  wordWrap: false,
};

export const SETTINGS_STORAGE_KEY = "shader-playground:settings";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 32;

/** Parses persisted settings, falling back per field on invalid values. */
export function parseSettings(json: string | null): Settings {
  if (!json) {
    return { ...DEFAULT_SETTINGS };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
  if (typeof raw !== "object" || raw === null) {
    return { ...DEFAULT_SETTINGS };
  }
  const record = raw as Record<string, unknown>;
  const fontSize =
    typeof record.editorFontSize === "number" && Number.isFinite(record.editorFontSize)
      ? Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, record.editorFontSize))
      : DEFAULT_SETTINGS.editorFontSize;

  return {
    themeMode: record.themeMode === "dark" ? "dark" : "light",
    autoRun: record.autoRun === true,
    editorFontSize: fontSize,
    wordWrap: record.wordWrap === true,
  };
}

/** Loads settings from storage (falls back to defaults). */
export function loadSettings(
  storage: Pick<Storage, "getItem">,
  key: string = SETTINGS_STORAGE_KEY
): Settings {
  try {
    return parseSettings(storage.getItem(key));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persists settings to storage, ignoring storage failures. */
export function saveSettings(
  storage: Pick<Storage, "setItem">,
  settings: Settings,
  key: string = SETTINGS_STORAGE_KEY
): void {
  try {
    storage.setItem(key, JSON.stringify(settings));
  } catch {
    // Storage full/unavailable — settings simply won't persist.
  }
}
