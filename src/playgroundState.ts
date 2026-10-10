import defaultFragmentShader from "./shaders/fragment_shader.frag";
import {
  DEFAULT_DOWNLOAD_SHADER_FILENAME,
  DEFAULT_SCREENSHOT_FILENAME,
  DEFAULT_SCREENSHOT_HEIGHT,
  DEFAULT_SCREENSHOT_WIDTH,
  DEFAULT_TEXTURE_PATH,
} from "./constants";

export interface PlaygroundState {
  /** Editor contents (may be dirty relative to compiledShader). */
  editorSource: string;
  /** Shader currently applied to the preview. */
  compiledShader: string;
  width: number;
  height: number;
  screenshotFilename: string;
  /** Non-empty while a screenshot capture is pending. */
  pendingScreenshotFilename: string;
  downloadShaderFilename: string;
  texturePath: string;
  /** Latest GLSL compile error, or null when the shader compiles. */
  compileError: string | null;
  /** Latest texture load failure message, or null when the texture loaded. */
  textureError: string | null;
  /** Latest screenshot failure message, or null when the capture succeeded. */
  screenshotError: string | null;
  /** UI theme. */
  themeMode: "light" | "dark";
}

export const initialPlaygroundState: PlaygroundState = {
  editorSource: defaultFragmentShader,
  compiledShader: defaultFragmentShader,
  width: DEFAULT_SCREENSHOT_WIDTH,
  height: DEFAULT_SCREENSHOT_HEIGHT,
  screenshotFilename: DEFAULT_SCREENSHOT_FILENAME,
  pendingScreenshotFilename: "",
  downloadShaderFilename: DEFAULT_DOWNLOAD_SHADER_FILENAME,
  texturePath: DEFAULT_TEXTURE_PATH,
  compileError: null,
  textureError: null,
  screenshotError: null,
  themeMode: "light",
};

export type PlaygroundAction =
  | { type: "editSource"; source: string }
  | { type: "runShader" }
  | { type: "setWidth"; width: number }
  | { type: "setHeight"; height: number }
  | { type: "setScreenshotFilename"; filename: string }
  | { type: "captureScreenshot" }
  | { type: "screenshotTaken" }
  | { type: "setDownloadShaderFilename"; filename: string }
  | { type: "pickImage"; texturePath: string }
  | { type: "setCompileError"; error: string | null }
  | { type: "setTextureError"; error: string | null }
  | { type: "setScreenshotError"; error: string | null }
  | { type: "toggleTheme" };

export function playgroundReducer(
  state: PlaygroundState,
  action: PlaygroundAction
): PlaygroundState {
  switch (action.type) {
    case "editSource":
      return { ...state, editorSource: action.source };
    case "runShader":
      return { ...state, compiledShader: state.editorSource };
    case "setWidth":
      return { ...state, width: action.width };
    case "setHeight":
      return { ...state, height: action.height };
    case "setScreenshotFilename":
      return { ...state, screenshotFilename: action.filename };
    case "captureScreenshot":
      return { ...state, pendingScreenshotFilename: state.screenshotFilename };
    case "screenshotTaken":
      return { ...state, pendingScreenshotFilename: "" };
    case "setDownloadShaderFilename":
      return { ...state, downloadShaderFilename: action.filename };
    case "pickImage":
      return { ...state, texturePath: action.texturePath };
    case "setCompileError":
      return { ...state, compileError: action.error };
    case "setTextureError":
      return { ...state, textureError: action.error };
    case "setScreenshotError":
      return { ...state, screenshotError: action.error };
    case "toggleTheme":
      return {
        ...state,
        themeMode: state.themeMode === "light" ? "dark" : "light",
      };
  }
}
