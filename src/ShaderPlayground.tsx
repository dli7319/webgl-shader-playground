import React from "react";

import { ShaderPreview } from "./preview";
import { PreviewPane } from "./PreviewPane";
import { EditorPane } from "./EditorPane";
import { ModuleStack } from "./ModuleStack";
import { Button } from "./ui/Button";
import { usePlaygroundState } from "./usePlaygroundState";
import { loadTextureWithFallback } from "./textures";
import { applyThemeToDocument } from "./theme";
import { loadSettings, saveSettings, type Settings } from "./settings";
import { SettingsDialog } from "./SettingsDialog";
import { handleShortcutEvent } from "./shortcuts";
import { createDebouncer } from "./debounce";
import { compileStatusFrom } from "./status";
import { confirmReset, isDirty } from "./guard";
import { FIT_ZOOM } from "./zoom";
import { canRedo, canUndo } from "./history";
import { createToastStore } from "./toast";
import { ToastHost } from "./ToastHost";
import { captureAndDownloadSceneScreenshot } from "./screenshot";
import { clearDraft, loadDraft, saveDraft } from "./draftStore";
import { downloadTextFile, triggerDownload } from "./download";
import {
  createRecordingSession,
  pickRecordingMimeType,
  recordingFilename,
  type RecordingSession,
} from "./recorder";
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
    setZoom,
    zoomIn,
    zoomOut,
    setEditorFontSize,
    setWordWrap,
    setThemeMode,
    undoEditor,
    redoEditor,
  } = usePlaygroundState(React.useMemo(() => loadSettings(window.localStorage), []));

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [pendingDraft] = React.useState(() => loadDraft(window.localStorage));
  const [draftDismissed, setDraftDismissed] = React.useState(false);

  // Auto-save the editor as a draft (skipped while the restore prompt is
  // still up, so mounting the app can't clobber the previous session's draft).
  React.useEffect(() => {
    if (pendingDraft && !draftDismissed) {
      return;
    }
    saveDraft(window.localStorage, state.editorSource);
  }, [state.editorSource, pendingDraft, draftDismissed]);

  // Persist the settings subset whenever it changes.
  React.useEffect(() => {
    const settings: Settings = {
      themeMode: state.themeMode,
      autoRun: state.autoRun,
      editorFontSize: state.editorFontSize,
      wordWrap: state.wordWrap,
    };
    saveSettings(window.localStorage, settings);
  }, [state.themeMode, state.autoRun, state.editorFontSize, state.wordWrap]);

  function applySettings(patch: Partial<Settings>) {
    if (patch.themeMode !== undefined) {
      setThemeMode(patch.themeMode);
    }
    if (patch.autoRun !== undefined) {
      toggleAutoRun();
    }
    if (patch.editorFontSize !== undefined) {
      setEditorFontSize(patch.editorFontSize);
    }
    if (patch.wordWrap !== undefined) {
      setWordWrap(patch.wordWrap);
    }
  }

  const fitZoom = React.useCallback(() => setZoom(FIT_ZOOM), [setZoom]);

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

  const [isRecording, setIsRecording] = React.useState(false);
  const recordingRef = React.useRef<RecordingSession | null>(null);
  const recordingSupported = React.useMemo(
    () =>
      typeof window.MediaRecorder === "function" &&
      pickRecordingMimeType(
        window.MediaRecorder.isTypeSupported.bind(window.MediaRecorder)
      ) !== null,
    []
  );

  async function toggleRecording() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (!isRecording) {
      try {
        recordingRef.current = createRecordingSession(canvas);
        setIsRecording(true);
      } catch {
        toastStore.add("Recording is not supported in this browser");
      }
      return;
    }
    const session = recordingRef.current;
    recordingRef.current = null;
    setIsRecording(false);
    if (session) {
      const filename = recordingFilename();
      const blob = await session.stop();
      triggerDownload(URL.createObjectURL(blob), filename);
      toastStore.add(`Recording saved as ${filename}`);
    }
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-col text-ink">
      <header className="mx-2 mt-2 flex flex-wrap items-center justify-end gap-2">
        <div className="grow">
          <h1 className="m-0 text-xl font-bold uppercase tracking-[0.22em]">
            Shader Playground
          </h1>
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-60">
            WebGL · GLSL fragment lab
          </p>
        </div>
        <Button variant="outlined" onClick={toggleTheme}>
          {state.themeMode === "light" ? "Dark theme" : "Light theme"}
        </Button>
        <Button variant="outlined" onClick={() => setSettingsOpen(true)}>
          Settings
        </Button>
      </header>
      {pendingDraft && !draftDismissed ? (
        <div
          className="surface-panel my-2 mx-2 flex items-center gap-2 p-2 text-sm"
          role="status"
        >
          <span className="grow">Unsaved draft from your last session is available.</span>
          <Button
            variant="outlined"
            onClick={() => {
              editSource(pendingDraft);
              setDraftDismissed(true);
            }}
          >
            Restore
          </Button>
          <Button
            variant="outlined"
            tone="warning"
            onClick={() => {
              clearDraft(window.localStorage);
              setDraftDismissed(true);
            }}
          >
            Discard
          </Button>
        </div>
      ) : null}
      <div className="m-2 flex min-h-0 min-w-0 grow flex-row items-stretch gap-2 max-[1100px]:flex-col">
        <div className="flex min-w-0 grow basis-0 flex-row gap-2 max-[900px]:flex-col">
          <PreviewPane
            canvasRef={canvasRef}
            width={state.width}
            height={state.height}
            compileError={state.compileError}
            textureError={state.textureError}
            screenshotError={state.screenshotError}
            status={compileStatusFrom(state.hasRun, state.compileError)}
            runDurationMs={state.runDurationMs}
            zoomPercent={state.zoomPercent}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomFit={fitZoom}
          />
          <EditorPane
            shaderSource={state.editorSource}
            onShaderSourceChange={editSource}
            editorFontSize={state.editorFontSize}
            wordWrap={state.wordWrap}
            themeMode={state.themeMode}
          />
        </div>
        <ModuleStack
          width={state.width}
          height={state.height}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
          screenshotFilename={state.screenshotFilename}
          onScreenshotFilenameChange={setScreenshotFilename}
          onCaptureScreenshot={captureScreenshot}
          downloadShaderFilename={state.downloadShaderFilename}
          onDownloadShaderFilenameChange={setDownloadShaderFilename}
          onDownloadShader={downloadShader}
          currentSource={state.editorSource}
          onApplySource={editSource}
          canUndo={canUndo(state.history)}
          canRedo={canRedo(state.history)}
          onUndo={undoEditor}
          onRedo={redoEditor}
          onResetShader={resetShader}
          autoRun={state.autoRun}
          onToggleAutoRun={toggleAutoRun}
          onPickImage={pickImage}
          texturePath={state.texturePath}
        />
      </div>
      <footer className="hud-action-bar sticky bottom-0 z-20 mx-2 mb-2 flex flex-wrap items-center gap-3 px-3 py-2">
        <div className="flex grow flex-row flex-wrap items-center gap-2">
          <Button
            variant="contained"
            className="min-w-56"
            onClick={runShader}
          >
            Run Shader (<span className="key-hint">Ctrl+Enter</span>)
          </Button>
          {recordingSupported ? (
            <Button
              variant="outlined"
              tone={isRecording ? "live" : undefined}
              onClick={toggleRecording}
            >
              {isRecording ? "Stop recording" : "Record (WebM)"}
            </Button>
          ) : null}
        </div>
        <span
          className="hud-readout whitespace-nowrap"
          aria-hidden="true"
          style={{
            color: isRecording ? "var(--accent-2)" : "var(--text)",
            opacity: isRecording ? 1 : 0.55,
          }}
        >
          {isRecording ? "● REC" : "○ REC"}
        </span>
      </footer>
      <ToastHost store={toastStore} />
      {settingsOpen ? (
        <SettingsDialog
          settings={{
            themeMode: state.themeMode,
            autoRun: state.autoRun,
            editorFontSize: state.editorFontSize,
            wordWrap: state.wordWrap,
          }}
          onChange={applySettings}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
