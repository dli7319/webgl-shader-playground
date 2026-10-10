import defaultFragmentShader from "./shaders/fragment_shader.frag";

export const DEFAULT_TEXTURE_PATH = "cat-7738210_1920.jpg";
export const DEFAULT_SCREENSHOT_WIDTH = 1920;
export const DEFAULT_SCREENSHOT_HEIGHT = 1080;

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
}

export const initialPlaygroundState: PlaygroundState = {
  editorSource: defaultFragmentShader,
  compiledShader: defaultFragmentShader,
  width: DEFAULT_SCREENSHOT_WIDTH,
  height: DEFAULT_SCREENSHOT_HEIGHT,
  screenshotFilename: "screenshot.png",
  pendingScreenshotFilename: "",
  downloadShaderFilename: "fragment.frag",
  texturePath: DEFAULT_TEXTURE_PATH,
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
  | { type: "pickImage"; texturePath: string };

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
  }
}
