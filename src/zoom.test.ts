import { describe, expect, it } from "vitest";
import { clampZoom, FIT_ZOOM, MAX_ZOOM, MIN_ZOOM, zoomIn, zoomOut } from "./zoom";

describe("clampZoom", () => {
  it("keeps values in range", () => {
    expect(clampZoom(100)).toBe(100);
    expect(clampZoom(25)).toBe(MIN_ZOOM);
    expect(clampZoom(400)).toBe(MAX_ZOOM);
    expect(clampZoom(12)).toBe(MIN_ZOOM);
    expect(clampZoom(9999)).toBe(MAX_ZOOM);
  });

  it("handles invalid values by fitting", () => {
    expect(clampZoom(Number.NaN)).toBe(FIT_ZOOM);
    expect(clampZoom(Number.POSITIVE_INFINITY)).toBe(FIT_ZOOM);
    expect(clampZoom(-Number.POSITIVE_INFINITY)).toBe(FIT_ZOOM);
  });
});

describe("zoomIn / zoomOut", () => {
  it("steps by ZOOM_STEP and clamps at the edges", () => {
    expect(zoomIn(100)).toBe(125);
    expect(zoomOut(100)).toBe(75);
    expect(zoomIn(MAX_ZOOM)).toBe(MAX_ZOOM);
    expect(zoomOut(MIN_ZOOM)).toBe(MIN_ZOOM);
  });
});
