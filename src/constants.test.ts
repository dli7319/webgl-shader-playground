import { describe, expect, it } from "vitest";
import {
  DEFAULT_DOWNLOAD_SHADER_FILENAME,
  DEFAULT_SCREENSHOT_FILENAME,
  DEFAULT_SCREENSHOT_HEIGHT,
  DEFAULT_SCREENSHOT_WIDTH,
  DEFAULT_TEXTURE_PATH,
  PREVIEW_CAMERA,
  PREVIEW_PLANE_SIZE,
} from "./constants";
import { isSupportedImageFilename } from "./files";

describe("constants", () => {
  it("default export filenames use supported image extensions", () => {
    expect(isSupportedImageFilename(DEFAULT_SCREENSHOT_FILENAME)).toBe(true);
  });

  it("default shader filename keeps the .frag extension", () => {
    expect(DEFAULT_DOWNLOAD_SHADER_FILENAME.endsWith(".frag")).toBe(true);
  });

  it("default texture is a bundled plain filename", () => {
    expect(DEFAULT_TEXTURE_PATH).not.toMatch(/^[a-z]+:/);
    expect(DEFAULT_TEXTURE_PATH).not.toContain("/");
  });

  it("default export dimensions are sane", () => {
    expect(DEFAULT_SCREENSHOT_WIDTH).toBeGreaterThan(0);
    expect(DEFAULT_SCREENSHOT_HEIGHT).toBeGreaterThan(0);
    expect(DEFAULT_SCREENSHOT_WIDTH % 2).toBe(0);
    expect(DEFAULT_SCREENSHOT_HEIGHT % 2).toBe(0);
  });

  it("camera bounds frame the preview plane exactly", () => {
    expect(PREVIEW_CAMERA.right - PREVIEW_CAMERA.left).toBe(PREVIEW_PLANE_SIZE);
    expect(PREVIEW_CAMERA.top - PREVIEW_CAMERA.bottom).toBe(PREVIEW_PLANE_SIZE);
    expect(PREVIEW_CAMERA.left).toBe(-PREVIEW_CAMERA.right);
    expect(PREVIEW_CAMERA.bottom).toBe(-PREVIEW_CAMERA.top);
  });

  it("camera sees the mesh", () => {
    expect(PREVIEW_CAMERA.near).toBeGreaterThan(0);
    expect(PREVIEW_CAMERA.meshZ).toBeLessThan(PREVIEW_CAMERA.positionZ);
    expect(PREVIEW_CAMERA.positionZ - PREVIEW_CAMERA.meshZ).toBeLessThan(
      PREVIEW_CAMERA.far
    );
  });
});
