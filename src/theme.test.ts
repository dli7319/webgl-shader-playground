import { describe, expect, it } from "vitest";
import { applyThemeToDocument, buildTheme, THEME_BACKGROUNDS } from "./theme";

describe("buildTheme", () => {
  it("maps the mode onto the MUI palette", () => {
    expect(buildTheme("light").palette.mode).toBe("light");
    expect(buildTheme("dark").palette.mode).toBe("dark");
    expect(buildTheme("dark").palette.background?.default).toBe(THEME_BACKGROUNDS.dark);
  });
});

describe("applyThemeToDocument", () => {
  // jsdom normalizes inline colors to `rgb(r, g, b)`.
  function rgb(hex: string): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  }

  it("sets the data-theme attribute and body background", () => {
    applyThemeToDocument("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.body.style.backgroundColor).toBe(rgb(THEME_BACKGROUNDS.dark));

    applyThemeToDocument("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.body.style.backgroundColor).toBe(rgb(THEME_BACKGROUNDS.light));
  });
});
