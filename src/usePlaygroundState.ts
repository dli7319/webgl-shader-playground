import React from "react";

import {
  initialStateWith,
  playgroundReducer,
  type PlaygroundState,
} from "./playgroundState";
import type { ChannelSource, PassId, RenderPassId } from "./passes";

/**
 * Owns the playground's state and exposes named actions. All state
 * transitions live in the pure {@link playgroundReducer}.
 */
export function usePlaygroundState(initialOverrides?: Partial<PlaygroundState>) {
  const [state, dispatch] = React.useReducer(
    playgroundReducer,
    initialOverrides,
    initialStateWith
  );

  const actions = React.useMemo(
    () => ({
      editSource: (source: string) => dispatch({ type: "editSource", source }),
      runShader: () => dispatch({ type: "runShader" }),
      setWidth: (width: number) => dispatch({ type: "setWidth", width }),
      setHeight: (height: number) => dispatch({ type: "setHeight", height }),
      setScreenshotFilename: (filename: string) =>
        dispatch({ type: "setScreenshotFilename", filename }),
      captureScreenshot: () => dispatch({ type: "captureScreenshot" }),
      screenshotTaken: () => dispatch({ type: "screenshotTaken" }),
      setDownloadShaderFilename: (filename: string) =>
        dispatch({ type: "setDownloadShaderFilename", filename }),
      pickImage: (texturePath: string) => dispatch({ type: "pickImage", texturePath }),
      setCompileError: (error: string | null) =>
        dispatch({ type: "setCompileError", error }),
      setTextureError: (error: string | null) =>
        dispatch({ type: "setTextureError", error }),
      setScreenshotError: (error: string | null) =>
        dispatch({ type: "setScreenshotError", error }),
      toggleTheme: () => dispatch({ type: "toggleTheme" }),
      toggleAutoRun: () => dispatch({ type: "toggleAutoRun" }),
      reportRun: (durationMs: number) => dispatch({ type: "reportRun", durationMs }),
      resetEditorSource: () => dispatch({ type: "resetEditor" }),
      setZoom: (percent: number) => dispatch({ type: "setZoom", percent }),
      zoomIn: () => dispatch({ type: "zoomIn" }),
      zoomOut: () => dispatch({ type: "zoomOut" }),
      setEditorFontSize: (size: number) => dispatch({ type: "setEditorFontSize", size }),
      setWordWrap: (enabled: boolean) => dispatch({ type: "setWordWrap", enabled }),
      setThemeMode: (mode: "light" | "dark") => dispatch({ type: "setThemeMode", mode }),
      undoEditor: () => dispatch({ type: "undoEditor" }),
      redoEditor: () => dispatch({ type: "redoEditor" }),
      selectPass: (pass: PassId) => dispatch({ type: "selectPass", pass }),
      setChannel: (pass: RenderPassId, index: number, source: ChannelSource) =>
        dispatch({ type: "setChannel", pass, index, source }),
    }),
    []
  );

  return { state, ...actions };
}
