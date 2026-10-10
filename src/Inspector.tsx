import React from "react";

import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Switch } from "./ui/Switch";
import { ImageIcon } from "./ui/icons";
import { ShaderHistory } from "./ShaderHistory";
import { createShaderStore } from "./shaderStore";
import { DEFAULT_TEXTURE_PATH } from "./constants";

export interface InspectorProps {
  shaderSource: string;
  onApplyShader: (source: string) => void;
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  texturePath: string;
  onPickImage: (dataUrl: string) => void;
  autoRun: boolean;
  onToggleAutoRun: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetShader: () => void;
  isRecording: boolean;
  recordingSupported: boolean;
  onToggleRecording: () => void;
}

interface InspectorSectionProps {
  title: string;
  /** Read-only state summary shown beside the disclosure opener. */
  summary: string;
  /** Swaps a live flag into the chip (e.g. while recording). */
  live?: boolean;
  liveSummary?: string;
  children: React.ReactNode;
}

function ChevronIcon() {
  return (
    <svg
      className="chevron"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function InspectorSection({
  title,
  summary,
  live = false,
  liveSummary,
  children,
}: InspectorSectionProps) {
  const [open, setOpen] = React.useState(false);
  const panelId = `inspector-section-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  const chipText = live && liveSummary ? liveSummary : summary;
  return (
    <section className="inspector-section">
      <button
        type="button"
        className="section-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="grow">{title}</span>
        <span className="state-chip" title={chipText}>
          {live ? (
            <span
              className="size-2 shrink-0 rounded-full bg-error"
              aria-hidden="true"
            />
          ) : null}
          <span className="chip-text">{chipText}</span>
        </span>
        <ChevronIcon />
      </button>
      {open ? (
        <div id={panelId} className="flex flex-col gap-4 px-4 pb-5 pt-1">
          {children}
        </div>
      ) : null}
    </section>
  );
}

const GROUP_LABEL = "mb-1 flex items-center justify-between gap-2 text-[12px] font-semibold text-quiet";

/**
 * Right inspector rail: export, history, texture and editor settings as
 * titled disclosure sections. Every section reports its state through a
 * compact read-only chip beside its opener, so nothing is ever hidden
 * without a summary.
 */
export function Inspector({
  shaderSource,
  onApplyShader,
  width,
  height,
  onWidthChange,
  onHeightChange,
  screenshotFilename,
  onScreenshotFilenameChange,
  onCaptureScreenshot,
  downloadShaderFilename,
  onDownloadShaderFilenameChange,
  onDownloadShader,
  texturePath,
  onPickImage,
  autoRun,
  onToggleAutoRun,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetShader,
  isRecording,
  recordingSupported,
  onToggleRecording,
}: InspectorProps) {
  const store = React.useMemo(() => createShaderStore(window.localStorage), []);
  const entries = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [pickedTextureName, setPickedTextureName] = React.useState<string | null>(
    null
  );

  const textureSummary =
    pickedTextureName ??
    (texturePath === DEFAULT_TEXTURE_PATH ? "Default texture" : "Custom image");

  return (
    <aside
      className="inspector-rail flex w-[336px] shrink-0 flex-col self-start max-[900px]:w-full max-[900px]:self-auto"
      aria-label="Inspector"
    >
      <div className="section-label px-4 pb-1 pt-4">Inspector</div>
      <InspectorSection
        title="Export"
        summary={`${width}×${height} · ${screenshotFilename}`}
        live={isRecording}
        liveSummary={`${width}×${height} · recording`}
      >
        <div className="flex flex-col gap-3">
          <div className={GROUP_LABEL}>Screenshot</div>
          <div className="flex items-center gap-3">
            <TextField
              label="Width"
              type="number"
              className="grow"
              value={width}
              aria-label="Screenshot width in pixels"
              onChange={(v) => onWidthChange(Number(v))}
            />
            <TextField
              label="Height"
              type="number"
              className="grow"
              value={height}
              aria-label="Screenshot height in pixels"
              onChange={(v) => onHeightChange(Number(v))}
            />
          </div>
          <TextField
            label="Filename"
            type="text"
            value={screenshotFilename}
            aria-label="Screenshot filename"
            onChange={onScreenshotFilenameChange}
          />
          <Button variant="outlined" onClick={onCaptureScreenshot}>
            Screenshot!
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <div className={GROUP_LABEL}>Shader source</div>
          <TextField
            label="Filename"
            type="text"
            value={downloadShaderFilename}
            aria-label="Shader download filename"
            onChange={onDownloadShaderFilenameChange}
          />
          <Button variant="outlined" onClick={onDownloadShader}>
            Download Shader (Ctrl+S)
          </Button>
        </div>
        {recordingSupported ? (
          <div className="flex flex-col gap-3">
            <div className={GROUP_LABEL}>Video</div>
            <Button
              variant="outlined"
              tone={isRecording ? "live" : undefined}
              onClick={onToggleRecording}
            >
              {isRecording ? "Stop recording" : "Record (WebM)"}
            </Button>
          </div>
        ) : null}
      </InspectorSection>
      <InspectorSection
        title="History"
        summary={entries.length === 0 ? "No saves" : `${entries.length} saved`}
      >
        <ShaderHistory
          entries={entries}
          currentSource={shaderSource}
          onSave={(name) => {
            store.save(name, shaderSource);
          }}
          onApply={onApplyShader}
          onDelete={(id) => store.remove(id)}
        />
      </InspectorSection>
      <InspectorSection title="Texture" summary={textureSummary}>
        <label className="inline-flex h-10 min-w-16 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-edge-strong bg-panel px-4 text-sm font-semibold text-ink transition-colors hover:bg-[var(--hover-fill)]">
          <ImageIcon /> Pick tDiffuse Image
          <input
            type="file"
            className="sr-only"
            aria-label="Choose a texture image"
            accept="image/*"
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                setPickedTextureName(file.name);
                const reader = new FileReader();
                reader.onload = (e) => {
                  const dataUrl = e.target?.result;
                  if (typeof dataUrl === "string") {
                    onPickImage(dataUrl);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      </InspectorSection>
      <InspectorSection
        title="Editor"
        summary={autoRun ? "Auto-run on" : "Auto-run off"}
      >
        <div className="flex items-center gap-2">
          <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
            Undo
          </Button>
          <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
            Redo
          </Button>
        </div>
        <div className="inset-row flex items-center px-4 py-1.5">
          <Switch
            checked={autoRun}
            onChange={onToggleAutoRun}
            label="Auto-run while typing"
          />
        </div>
        <Button variant="outlined" tone="danger" onClick={onResetShader}>
          Reset to default shader
        </Button>
      </InspectorSection>
    </aside>
  );
}
