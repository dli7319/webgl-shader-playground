import React from "react";

import { ShaderPreview } from "./preview";
import { PreviewPane } from "./PreviewPane";
import { EditorPane } from "./EditorPane";
import { ActionDock, type DockSheetName } from "./ActionDock";
import { DockSheet } from "./DockSheet";
import { ExportSheet } from "./ExportSheet";
import { ShaderHistory } from "./ShaderHistory";
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
import { createShaderStore } from "./shaderStore";
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

  // Which glass sheet is open above the dock (none by default).
  const [openSheet, setOpenSheet] = React.useState<DockSheetName | null>(null);
  const [textureLabel, setTextureLabel] = React.useState("default texture");
  const [pendingDraft] = React.useState(() => loadDraft(window.localStorage));
  const [draftDismissed, setDraftDismissed] = React.useState(false);

  // Shared shader store: the history sheet and the dock's "N saved" summary
  // read the same source of truth.
  const shaderStore = React.useMemo(() => createShaderStore(window.localStorage), []);
  const savedShaders = React.useSyncExternalStore(
    shaderStore.subscribe,
    shaderStore.getSnapshot
  );

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

  function handlePickImage(dataUrl: string, fileName: string) {
    setTextureLabel(fileName);
    pickImage(dataUrl);
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

  function toggleSheet(sheet: DockSheetName) {
    setOpenSheet((current) => (current === sheet ? null : sheet));
  }

  return (
    <div className="min-h-screen pb-32 text-ink">
      {pendingDraft && !draftDismissed ? (
        <div
          className="surface-panel mx-3 my-3 flex items-center gap-2 px-4 py-3 text-sm"
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
      <div className="mx-3 mt-3 flex flex-row items-stretch gap-3 max-[900px]:flex-col">
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
          canUndo={canUndo(state.history)}
          canRedo={canRedo(state.history)}
          onUndo={undoEditor}
          onRedo={redoEditor}
        />
      </div>
      <ActionDock
        onRunShader={runShader}
        themeMode={state.themeMode}
        onToggleTheme={toggleTheme}
        openSheet={openSheet}
        onToggleSheet={toggleSheet}
        width={state.width}
        height={state.height}
        screenshotFilename={state.screenshotFilename}
        downloadShaderFilename={state.downloadShaderFilename}
        isRecording={isRecording}
        savedCount={savedShaders.length}
        editorFontSize={state.editorFontSize}
        wordWrap={state.wordWrap}
        autoRun={state.autoRun}
        textureLabel={textureLabel}
      />
      {openSheet === "export" ? (
        <ExportSheet
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
          recordingSupported={recordingSupported}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}
      {openSheet === "history" ? (
        <DockSheet title="History" onClose={() => setOpenSheet(null)}>
          <div className="sheet-group">
            <span className="sheet-group-label">Saved shaders</span>
            <div className="w-full">
              <ShaderHistory
                store={shaderStore}
                currentSource={state.editorSource}
                onApply={editSource}
              />
            </div>
          </div>
        </DockSheet>
      ) : null}
      {openSheet === "settings" ? (
        <SettingsDialog
          settings={{
            themeMode: state.themeMode,
            autoRun: state.autoRun,
            editorFontSize: state.editorFontSize,
            wordWrap: state.wordWrap,
          }}
          textureLabel={textureLabel}
          onChange={applySettings}
          onPickImage={handlePickImage}
          onResetShader={resetShader}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}
      <ToastHost store={toastStore} />
    </div>
  );
}
