import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import {
  captureAndDownloadSceneScreenshot,
  captureSceneToDataUrl,
  getScreenshotRenderer,
  resetScreenshotRenderer,
} from "./screenshot";

function fakeRenderer(dataUrl = "data:image/png;base64,AAAA") {
  return {
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: {
      toDataURL: vi.fn(() => dataUrl),
    },
  } as unknown as THREE.WebGLRenderer;
}

const scene = new THREE.Scene();
const camera = new THREE.Camera();

function useFake(dataUrl?: string): ReturnType<typeof fakeRenderer> {
  resetScreenshotRenderer();
  const renderer = fakeRenderer(dataUrl);
  getScreenshotRenderer(() => renderer);
  return renderer;
}

afterEach(() => {
  resetScreenshotRenderer();
});

describe("captureSceneToDataUrl", () => {
  it("renders at the requested size and encodes with the filename's MIME", () => {
    const renderer = useFake();
    const result = captureSceneToDataUrl(scene, camera, {
      filename: "shot.png",
      width: 1920,
      height: 1080,
    });

    expect(result).toEqual({ ok: true, dataUrl: "data:image/png;base64,AAAA" });
    expect(renderer.setSize).toHaveBeenCalledWith(1920, 1080);
    expect(renderer.render).toHaveBeenCalledWith(scene, camera);
    expect(renderer.domElement.toDataURL).toHaveBeenCalledWith("image/png");
  });

  it("passes the right MIME type for jpeg filenames", () => {
    const renderer = useFake();
    captureSceneToDataUrl(scene, camera, {
      filename: "shot.jpg",
      width: 10,
      height: 10,
    });
    expect(renderer.domElement.toDataURL).toHaveBeenCalledWith("image/jpeg");
  });

  it("rejects unsupported filenames without touching the renderer", () => {
    const renderer = useFake();
    const result = captureSceneToDataUrl(scene, camera, {
      filename: "shot.gif",
      width: 10,
      height: 10,
    });
    expect(result.ok).toBe(false);
    expect(renderer.setSize).not.toHaveBeenCalled();
  });

  it("reports encoding failures", () => {
    useFake("");
    const result = captureSceneToDataUrl(scene, camera, {
      filename: "shot.png",
      width: 10,
      height: 10,
    });
    expect(result.ok).toBe(false);
  });
});

describe("shared offscreen renderer", () => {
  it("reuses one renderer across captures", () => {
    resetScreenshotRenderer();
    const factory = vi.fn(() => fakeRenderer());
    getScreenshotRenderer(factory);
    captureSceneToDataUrl(scene, camera, {
      filename: "a.png",
      width: 10,
      height: 10,
    });
    captureSceneToDataUrl(scene, camera, {
      filename: "b.png",
      width: 20,
      height: 20,
    });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("resetScreenshotRenderer disposes and recreates", () => {
    const renderer = useFake();
    resetScreenshotRenderer();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    const next = fakeRenderer();
    expect(getScreenshotRenderer(() => next)).toBe(next);
  });
});

describe("captureAndDownloadSceneScreenshot", () => {
  it("downloads the captured image", () => {
    useFake();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const ok = captureAndDownloadSceneScreenshot(scene, camera, {
      filename: "shot.png",
      width: 10,
      height: 10,
    });
    expect(ok.ok).toBe(true);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("returns false and logs on unsupported filenames", () => {
    useFake();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = captureAndDownloadSceneScreenshot(scene, camera, {
      filename: "shot.bmp",
      width: 10,
      height: 10,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("shot.bmp");
    }
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
