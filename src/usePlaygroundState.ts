import React from "react";

import { initialPlaygroundState, playgroundReducer } from "./playgroundState";

/**
 * Owns the playground's state and exposes named actions. All state
 * transitions live in the pure {@link playgroundReducer}.
 */
export function usePlaygroundState() {
  const [state, dispatch] = React.useReducer(playgroundReducer, initialPlaygroundState);

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
    }),
    []
  );

  return { state, ...actions };
}
