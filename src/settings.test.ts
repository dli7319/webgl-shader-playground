import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSettings } from "./settings";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("parseSettings", () => {
  it("returns defaults for missing or invalid JSON", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("{not json")).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("42")).toEqual(DEFAULT_SETTINGS);
  });

  it("parses valid settings", () => {
    const parsed = parseSettings(
      JSON.stringify({
        themeMode: "dark",
        autoRun: true,
        editorFontSize: 18,
        wordWrap: true,
      })
    );
    expect(parsed).toEqual({
      themeMode: "dark",
      autoRun: true,
      editorFontSize: 18,
      wordWrap: true,
    });
  });

  it("falls back per field and clamps font size", () => {
    const parsed = parseSettings(
      JSON.stringify({ themeMode: "neon", editorFontSize: 500 })
    );
    expect(parsed.themeMode).toBe("light");
    expect(parsed.editorFontSize).toBe(32);
    expect(parsed.autoRun).toBe(false);
    expect(parseSettings(JSON.stringify({ editorFontSize: 1 })).editorFontSize).toBe(8);
  });
});

describe("loadSettings / saveSettings", () => {
  it("round-trips through storage", () => {
    const storage = fakeStorage();
    const settings = { ...DEFAULT_SETTINGS, themeMode: "dark" as const };
    saveSettings(storage, settings);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it("tolerates storage failures", () => {
    const throwing = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadSettings(throwing)).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(throwing, DEFAULT_SETTINGS)).not.toThrow();
  });
});
