import React from "react";

import { ShaderPreview } from "./preview";
import { PreviewPane } from "./PreviewPane";
import { EditorPane } from "./EditorPane";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { InspectorSection } from "./ui/InspectorSection";
import { ImageIcon } from "./ui/icons";
import { ShaderHistory } from "./ShaderHistory";
import { createShaderStore } from "./shaderStore";
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
import { DEFAULT_TEXTURE_PATH } from "./constants";
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

  // Left-rail inspector sections (all disclosed by default — the surface
  // stays quiet and each opener reports its group's state).
  const [editorRailOpen, setEditorRailOpen] = React.useState(false);
  const [previewRailOpen, setPreviewRailOpen] = React.useState(false);
  const [historyRailOpen, setHistoryRailOpen] = React.useState(false);

  // Saved-shader store is lifted so the History opener can report its state.
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

  const textureSummary =
    state.texturePath === DEFAULT_TEXTURE_PATH ? "default texture" : "picked image";

  return (
    <div className="app-shell bg-app text-ink">
      <header className="title-bar">
        <h1 className="wordmark">WebGL Shader Playground</h1>
        <span className="title-note">GLSL · WebGL · {state.themeMode === "light" ? "light" : "dark"}</span>
      </header>
      {pendingDraft && !draftDismissed ? (
        <div
          className="surface-panel mx-5 mt-4 flex items-center gap-2 px-3 py-2 text-sm"
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
      <div className="workstation">
        <nav className="rail" aria-label="Workbench panels">
          <InspectorSection
            id="rail-editor"
            title="Editor"
            summary={state.autoRun ? "Auto-run on" : "Auto-run off"}
            open={editorRailOpen}
            onToggle={() => setEditorRailOpen((open) => !open)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outlined"
                onClick={undoEditor}
                disabled={!canUndo(state.history)}
              >
                Undo
              </Button>
              <Button
                variant="outlined"
                onClick={redoEditor}
                disabled={!canRedo(state.history)}
              >
                Redo
              </Button>
            </div>
            <Switch
              checked={state.autoRun}
              onChange={toggleAutoRun}
              label="Auto-run while typing"
            />
            <Button variant="outlined" tone="warning" onClick={resetShader}>
              Reset to default shader
            </Button>
          </InspectorSection>
          <InspectorSection
            id="rail-preview"
            title="Preview"
            summary={
              <span className="tabular-nums">
                {state.zoomPercent}% · {textureSummary}
              </span>
            }
            open={previewRailOpen}
            onToggle={() => setPreviewRailOpen((open) => !open)}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                className="min-w-9 px-3 text-sm"
                onClick={zoomOut}
                aria-label="Zoom out"
              >
                −
              </Button>
              <span className="min-w-14 text-center text-sm tabular-nums text-strong">
                {state.zoomPercent}%
              </span>
              <Button
                variant="outlined"
                className="min-w-9 px-3 text-sm"
                onClick={zoomIn}
                aria-label="Zoom in"
              >
                +
              </Button>
              <Button variant="outlined" onClick={fitZoom}>
                Fit
              </Button>
            </div>
            <label className="texture-pick">
              <ImageIcon /> Pick tDiffuse Image
              <input
                type="file"
                className="sr-only"
                aria-label="Choose a texture image"
                accept="image/*"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const dataUrl = e.target?.result;
                      if (typeof dataUrl === "string") {
                        pickImage(dataUrl);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </InspectorSection>
          <InspectorSection
            id="rail-history"
            title="History"
            summary={`${savedShaders.length} saved`}
            open={historyRailOpen}
            onToggle={() => setHistoryRailOpen((open) => !open)}
          >
            <ShaderHistory
              store={shaderStore}
              entries={savedShaders}
              currentSource={state.editorSource}
              onApply={editSource}
            />
          </InspectorSection>
          <div className="rail-foot">
            <Button variant="outlined" onClick={() => setSettingsOpen(true)}>
              Settings
            </Button>
          </div>
        </nav>
        <EditorPane
          shaderSource={state.editorSource}
          onShaderSourceChange={editSource}
          onRunShader={runShader}
          editorFontSize={state.editorFontSize}
          wordWrap={state.wordWrap}
          themeMode={state.themeMode}
        />
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
          zoomPercent={state.zoomPercent}
          downloadShaderFilename={state.downloadShaderFilename}
          onDownloadShaderFilenameChange={setDownloadShaderFilename}
          onDownloadShader={downloadShader}
          isRecording={isRecording}
          recordingSupported={recordingSupported}
          onToggleRecording={toggleRecording}
        />
      </div>
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
