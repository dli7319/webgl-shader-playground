import { describe, expect, it } from "vitest";
import {
  initialPlaygroundState,
  playgroundReducer,
  type PlaygroundState,
} from "./playgroundState";

const start: PlaygroundState = initialPlaygroundState;

describe("playgroundReducer", () => {
  it("starts from the default shader and texture", () => {
    expect(start.compiledShader).toBe(start.editorSource);
    expect(start.texturePath).toBe("cat-7738210_1920.jpg");
    expect(start.pendingScreenshotFilename).toBe("");
  });

  it("editSource only touches the editor buffer", () => {
    const next = playgroundReducer(start, {
      type: "editSource",
      source: "void main() {}",
    });
    expect(next.editorSource).toBe("void main() {}");
    expect(next.compiledShader).toBe(start.compiledShader);
  });

  it("runShader compiles the editor buffer into the preview", () => {
    const edited = playgroundReducer(start, {
      type: "editSource",
      source: "edited",
    });
    const compiled = playgroundReducer(edited, { type: "runShader" });
    expect(compiled.compiledShader).toBe("edited");
  });

  it("captureScreenshot snapshots the filename; screenshotTaken clears it", () => {
    const renamed = playgroundReducer(start, {
      type: "setScreenshotFilename",
      filename: "shot.jpg",
    });
    const pending = playgroundReducer(renamed, { type: "captureScreenshot" });
    expect(pending.pendingScreenshotFilename).toBe("shot.jpg");
    expect(pending.screenshotFilename).toBe("shot.jpg");
    const done = playgroundReducer(pending, { type: "screenshotTaken" });
    expect(done.pendingScreenshotFilename).toBe("");
  });

  it("tracks export dimensions and download filename", () => {
    let state = playgroundReducer(start, { type: "setWidth", width: 800 });
    state = playgroundReducer(state, { type: "setHeight", height: 600 });
    state = playgroundReducer(state, {
      type: "setDownloadShaderFilename",
      filename: "shader.frag",
    });
    expect(state.width).toBe(800);
    expect(state.height).toBe(600);
    expect(state.downloadShaderFilename).toBe("shader.frag");
  });

  it("pickImage swaps the texture path", () => {
    const next = playgroundReducer(start, {
      type: "pickImage",
      texturePath: "data:image/png;base64,AAAA",
    });
    expect(next.texturePath).toBe("data:image/png;base64,AAAA");
    expect(next.editorSource).toBe(start.editorSource);
  });

  it("setCompileError reports and clears GLSL errors", () => {
    const failed = playgroundReducer(start, {
      type: "setCompileError",
      error: "ERROR: 0:1: unexpected token",
    });
    expect(failed.compileError).toBe("ERROR: 0:1: unexpected token");
    const fixed = playgroundReducer(failed, {
      type: "setCompileError",
      error: null,
    });
    expect(fixed.compileError).toBeNull();
  });

  it("setTextureError reports and clears texture failures", () => {
    const failed = playgroundReducer(start, {
      type: "setTextureError",
      error: 'Could not load texture "bad.png"',
    });
    expect(failed.textureError).toBe('Could not load texture "bad.png"');
    const fixed = playgroundReducer(failed, {
      type: "setTextureError",
      error: null,
    });
    expect(fixed.textureError).toBeNull();
  });

  it("setScreenshotError reports and clears capture failures", () => {
    const failed = playgroundReducer(start, {
      type: "setScreenshotError",
      error: 'Unsupported screenshot format: "shot.gif"',
    });
    expect(failed.screenshotError).toContain("shot.gif");
    const fixed = playgroundReducer(failed, {
      type: "setScreenshotError",
      error: null,
    });
    expect(fixed.screenshotError).toBeNull();
  });

  it("actions never mutate the previous state", () => {
    const frozen = Object.freeze({ ...start });
    playgroundReducer(frozen, { type: "editSource", source: "x" });
    playgroundReducer(frozen, { type: "setWidth", width: 1 });
    expect(frozen.editorSource).toBe(start.editorSource);
    expect(frozen.width).toBe(start.width);
  });
});
