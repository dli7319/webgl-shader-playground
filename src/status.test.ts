import { describe, expect, it } from "vitest";
import { compileStatusFrom, formatDuration, STATUS_LABELS } from "./status";

describe("formatDuration", () => {
  it("formats sub-millisecond, milliseconds, and seconds", () => {
    expect(formatDuration(0.4)).toBe("<1 ms");
    expect(formatDuration(3.6)).toBe("4 ms");
    expect(formatDuration(999)).toBe("999 ms");
    expect(formatDuration(1500)).toBe("1.5 s");
    expect(formatDuration(12000)).toBe("12.0 s");
  });

  it("handles invalid input", () => {
    expect(formatDuration(Number.NaN)).toBe("—");
    expect(formatDuration(-5)).toBe("—");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("compileStatusFrom", () => {
  it("reports error when compilation failed", () => {
    expect(compileStatusFrom(true, "ERROR: bad")).toBe("error");
    expect(compileStatusFrom(false, "ERROR: bad")).toBe("error");
  });

  it("reports compiled only after a run", () => {
    expect(compileStatusFrom(false, null)).toBe("idle");
    expect(compileStatusFrom(true, null)).toBe("compiled");
  });

  it("labels cover every status", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(["compiled", "error", "idle"]);
  });
});
