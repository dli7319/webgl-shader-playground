import React from "react";
import Button from "@mui/material/Button";
import { ThemeProvider } from "@mui/material/styles";

import styles from "./styles/ShaderPlayground.module.css";
import { ShaderPreview } from "./preview";
import { PreviewPane } from "./PreviewPane";
import { EditorPane } from "./EditorPane";
import { usePlaygroundState } from "./usePlaygroundState";
import { loadTextureWithFallback } from "./textures";
import { applyThemeToDocument, buildTheme } from "./theme";
import { handleShortcutEvent } from "./shortcuts";
import { createDebouncer } from "./debounce";
import { compileStatusFrom } from "./status";
import { confirmReset, isDirty } from "./guard";
import { createToastStore } from "./toast";
import { ToastHost } from "./ToastHost";
import { captureAndDownloadSceneScreenshot } from "./screenshot";
import { downloadTextFile } from "./download";
import defaultVertexShader from "./shaders/vertex_shader.vert";

export default function ShaderPlayground() {
  const {
    state,
    editSource,
    runShader,
    setWidth,
    setHeight,
    setScreenshotFilename,
    captureScreenshot,
    screenshotTaken,
    setDownloadShaderFilename,
    pickImage,
    setCompileError,
    setTextureError,
    setScreenshotError,
    toggleTheme,
    toggleAutoRun,
    reportRun,
    resetEditorSource,
  } = usePlaygroundState();

  const theme = React.useMemo(() => buildTheme(state.themeMode), [state.themeMode]);
  const toastStore = React.useMemo(() => createToastStore(), []);

  React.useEffect(() => {
    applyThemeToDocument(state.themeMode);
  }, [state.themeMode]);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewRef = React.useRef<ShaderPreview | null>(null);

  // Create the renderer once and tear it down on unmount.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const preview = new ShaderPreview({
      canvas,
      vertexShader: defaultVertexShader,
      fragmentShader: state.compiledShader,
      onCompileError: setCompileError,
    });
    previewRef.current = preview;
    if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
      preview.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    preview.render();
    return () => {
      preview.dispose();
      previewRef.current = null;
    };
    // Mount-only: updates flow through the effects below.
  }, []);

  // Apply the compiled shader whenever it changes.
  React.useEffect(() => {
    const start = performance.now();
    previewRef.current?.setFragmentShader(state.compiledShader);
    reportRun(performance.now() - start);
  }, [state.compiledShader]);

  // Auto-run: apply editor changes after a pause in typing.
  const debouncer = React.useMemo(() => createDebouncer(600), []);
  React.useEffect(() => {
    if (!state.autoRun) {
      debouncer.cancel();
      return;
    }
    debouncer.schedule(runShader);
    return () => debouncer.cancel();
  }, [state.editorSource, state.autoRun]);

  // Load the tDiffuse texture (bundled path or picked image data URL),
  // falling back to the default texture when the load fails.
  React.useEffect(() => {
    let cancelled = false;
    loadTextureWithFallback(
      state.texturePath,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        previewRef.current?.setTexture(texture);
        setTextureError(null);
      },
      (message) => {
        if (!cancelled) {
          setTextureError(message);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [state.texturePath]);

  // Keep the drawing buffer in sync with the canvas' CSS size.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const preview = previewRef.current;
      if (!preview) {
        return;
      }
      preview.setSize(canvas.clientWidth, canvas.clientHeight);
      preview.render();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Screenshot flow (a side effect, so it lives in an effect).
  React.useEffect(() => {
    if (!state.pendingScreenshotFilename) {
      return;
    }
    const preview = previewRef.current;
    if (preview) {
      const result = captureAndDownloadSceneScreenshot(preview.scene, preview.camera, {
        filename: state.pendingScreenshotFilename,
        width: state.width,
        height: state.height,
      });
      setScreenshotError(result.ok ? null : result.error);
      if (result.ok) {
        toastStore.add(`Screenshot saved as ${state.pendingScreenshotFilename}`);
      }
    }
    screenshotTaken();
  }, [state.pendingScreenshotFilename, state.width, state.height]);

  function downloadShader() {
    downloadTextFile(state.downloadShaderFilename, state.editorSource);
    toastStore.add(`Shader downloaded as ${state.downloadShaderFilename}`);
  }

  function resetShader() {
    if (
      confirmReset(state.editorSource, state.compiledShader, (message) =>
        window.confirm(message)
      )
    ) {
      resetEditorSource();
    }
  }

  // Warn before leaving the page with uncompiled edits.
  React.useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (isDirty(state.editorSource, state.compiledShader)) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.editorSource, state.compiledShader]);

  // Global shortcuts (capture phase so Monaco doesn't swallow them).
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      handleShortcutEvent(event, {
        onRun: runShader,
        onDownload: () =>
          downloadTextFile(state.downloadShaderFilename, state.editorSource),
      });
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [state.editorSource, state.downloadShaderFilename]);

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.app}>
        <div className={styles.toolbar}>
          <Button variant="outlined" size="small" onClick={toggleTheme}>
            {state.themeMode === "light" ? "Dark theme" : "Light theme"}
          </Button>
        </div>
        <div className={styles.mainDiv}>
          <PreviewPane
            canvasRef={canvasRef}
            width={state.width}
            height={state.height}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            screenshotFilename={state.screenshotFilename}
            onScreenshotFilenameChange={setScreenshotFilename}
            onCaptureScreenshot={captureScreenshot}
            compileError={state.compileError}
            textureError={state.textureError}
            screenshotError={state.screenshotError}
            status={compileStatusFrom(state.hasRun, state.compileError)}
            runDurationMs={state.runDurationMs}
          />
          <EditorPane
            shaderSource={state.editorSource}
            onShaderSourceChange={editSource}
            onRunShader={runShader}
            downloadShaderFilename={state.downloadShaderFilename}
            onDownloadShaderFilenameChange={setDownloadShaderFilename}
            onDownloadShader={downloadShader}
            onPickImage={pickImage}
            autoRun={state.autoRun}
            onToggleAutoRun={toggleAutoRun}
            onResetShader={resetShader}
          />
        </div>
        <ToastHost store={toastStore} />
      </div>
    </ThemeProvider>
  );
}
