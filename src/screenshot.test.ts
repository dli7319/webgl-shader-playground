import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { captureAndDownloadSceneScreenshot, captureSceneToDataUrl } from "./screenshot";

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

describe("captureSceneToDataUrl", () => {
  it("renders at the requested size and encodes with the filename's MIME", () => {
    const renderer = fakeRenderer();
    const result = captureSceneToDataUrl(
      scene,
      camera,
      { filename: "shot.png", width: 1920, height: 1080 },
      () => renderer
    );

    expect(result).toEqual({ ok: true, dataUrl: "data:image/png;base64,AAAA" });
    expect(renderer.setSize).toHaveBeenCalledWith(1920, 1080);
    expect(renderer.render).toHaveBeenCalledWith(scene, camera);
    expect(renderer.domElement.toDataURL).toHaveBeenCalledWith("image/png");
    expect(renderer.dispose).toHaveBeenCalled();
  });

  it("passes the right MIME type for jpeg filenames", () => {
    const renderer = fakeRenderer();
    captureSceneToDataUrl(
      scene,
      camera,
      { filename: "shot.jpg", width: 10, height: 10 },
      () => renderer
    );
    expect(renderer.domElement.toDataURL).toHaveBeenCalledWith("image/jpeg");
  });

  it("rejects unsupported filenames without touching the renderer", () => {
    const create = vi.fn();
    const result = captureSceneToDataUrl(
      scene,
      camera,
      { filename: "shot.gif", width: 10, height: 10 },
      create
    );
    expect(result.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("reports encoding failures and still disposes the renderer", () => {
    const renderer = fakeRenderer("");
    const result = captureSceneToDataUrl(
      scene,
      camera,
      { filename: "shot.png", width: 10, height: 10 },
      () => renderer
    );
    expect(result.ok).toBe(false);
    expect(renderer.dispose).toHaveBeenCalled();
  });
});

describe("captureAndDownloadSceneScreenshot", () => {
  it("downloads the captured image", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const ok = captureAndDownloadSceneScreenshot(
      scene,
      camera,
      { filename: "shot.png", width: 10, height: 10 },
      () => fakeRenderer()
    );
    expect(ok).toBe(true);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("returns false and logs on unsupported filenames", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ok = captureAndDownloadSceneScreenshot(
      scene,
      camera,
      { filename: "shot.bmp", width: 10, height: 10 },
      () => fakeRenderer()
    );
    expect(ok).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
