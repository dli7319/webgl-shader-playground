import defaultFragmentShader from "./shaders/fragment_shader.frag";
import {
  DEFAULT_DOWNLOAD_SHADER_FILENAME,
  DEFAULT_SCREENSHOT_FILENAME,
  DEFAULT_SCREENSHOT_HEIGHT,
  DEFAULT_SCREENSHOT_WIDTH,
  DEFAULT_TEXTURE_PATH,
} from "./constants";
import { clampZoom, FIT_ZOOM, zoomIn, zoomOut } from "./zoom";
import {
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type History,
} from "./history";
import {
  defaultRouting,
  emptyPassSources,
  type ChannelSource,
  type PassId,
  type PassRouting,
  type PassSources,
  type RenderPassId,
} from "./passes";

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
  /** When true, shader edits are applied automatically (debounced). */
  autoRun: boolean;
  /** Whether a shader has been applied at least once. */
  hasRun: boolean;
  /** Duration of the last apply, in milliseconds. */
  runDurationMs: number | null;
  /** Preview zoom percentage (100 = fit to column). */
  zoomPercent: number;
  /** Monaco font size. */
  editorFontSize: number;
  /** Monaco word wrap. */
  wordWrap: boolean;
  /** Applied-shader history (snapshots at each run). */
  history: History<string>;
  /** Shadertoy multi-pass sources (Common / Buf A-D / Image). */
  passSources: PassSources;
  /** Which pass the editor is currently showing. */
  activePass: PassId;
  /** Per-pass iChannel wiring. */
  routing: PassRouting;
  /** Sources + routing snapshotted at the last run, for the renderer. */
  compiledPasses: { sources: PassSources; routing: PassRouting } | null;
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
  autoRun: false,
  hasRun: false,
  runDurationMs: null,
  zoomPercent: FIT_ZOOM,
  editorFontSize: 14,
  wordWrap: false,
  history: createHistory(defaultFragmentShader),
  passSources: { ...emptyPassSources(), image: defaultFragmentShader },
  activePass: "image",
  routing: defaultRouting(),
  compiledPasses: null,
};

/** Merges persisted settings (or other overrides) into the initial state. */
export function initialStateWith(
  overrides: Partial<PlaygroundState> | undefined
): PlaygroundState {
  return { ...initialPlaygroundState, ...overrides };
}

export type PlaygroundAction =
  | { type: "editSource"; source: string }
  | { type: "selectPass"; pass: PassId }
  | {
      type: "setChannel";
      pass: RenderPassId;
      index: number;
      source: ChannelSource;
    }
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
  | { type: "toggleTheme" }
  | { type: "toggleAutoRun" }
  | { type: "reportRun"; durationMs: number }
  | { type: "resetEditor" }
  | { type: "setZoom"; percent: number }
  | { type: "zoomIn" }
  | { type: "zoomOut" }
  | { type: "setEditorFontSize"; size: number }
  | { type: "setWordWrap"; enabled: boolean }
  | { type: "setThemeMode"; mode: "light" | "dark" }
  | { type: "undoEditor" }
  | { type: "redoEditor" };

export function playgroundReducer(
  state: PlaygroundState,
  action: PlaygroundAction
): PlaygroundState {
  switch (action.type) {
    case "editSource":
      return {
        ...state,
        editorSource: action.source,
        passSources: { ...state.passSources, [state.activePass]: action.source },
      };
    case "selectPass":
      return {
        ...state,
        activePass: action.pass,
        editorSource: state.passSources[action.pass],
      };
    case "setChannel": {
      const channels = [...state.routing[action.pass]] as ChannelSource[];
      channels[action.index] = action.source;
      return {
        ...state,
        routing: { ...state.routing, [action.pass]: channels },
      };
    }
    case "runShader": {
      const history = pushHistory(state.history, state.editorSource);
      return {
        ...state,
        compiledShader: state.editorSource,
        history,
        compiledPasses: {
          sources: { ...state.passSources },
          routing: state.routing,
        },
      };
    }
    case "undoEditor": {
      const history = undoHistory(state.history);
      return {
        ...state,
        history,
        editorSource: history.present,
        passSources: {
          ...state.passSources,
          [state.activePass]: history.present,
        },
      };
    }
    case "redoEditor": {
      const history = redoHistory(state.history);
      return {
        ...state,
        history,
        editorSource: history.present,
        passSources: {
          ...state.passSources,
          [state.activePass]: history.present,
        },
      };
    }
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
    case "toggleAutoRun":
      return { ...state, autoRun: !state.autoRun };
    case "reportRun":
      return {
        ...state,
        hasRun: true,
        runDurationMs: action.durationMs,
      };
    case "resetEditor": {
      const cleared = state.activePass === "image" ? defaultFragmentShader : "";
      return {
        ...state,
        editorSource: cleared,
        passSources: { ...state.passSources, [state.activePass]: cleared },
      };
    }
    case "setZoom":
      return { ...state, zoomPercent: clampZoom(action.percent) };
    case "zoomIn":
      return { ...state, zoomPercent: zoomIn(state.zoomPercent) };
    case "zoomOut":
      return { ...state, zoomPercent: zoomOut(state.zoomPercent) };
    case "setEditorFontSize":
      return {
        ...state,
        editorFontSize: Math.min(32, Math.max(8, Math.round(action.size))),
      };
    case "setWordWrap":
      return { ...state, wordWrap: action.enabled };
    case "setThemeMode":
      return { ...state, themeMode: action.mode };
  }
}
