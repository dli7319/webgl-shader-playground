import React from "react";

import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Switch } from "./ui/Switch";
import { HudModule } from "./ui/HudModule";
import { ImageIcon } from "./ui/icons";
import { ShaderHistory } from "./ShaderHistory";
import { DEFAULT_TEXTURE_PATH } from "./constants";

const PICK_LABEL =
  "hud-clip inline-flex min-w-16 cursor-pointer items-center justify-center gap-2 border border-edge bg-transparent px-4 py-[0.4rem] text-sm font-semibold uppercase tracking-[0.08em] text-ink transition-colors [font:inherit] hover:border-accent hover:bg-[var(--tint-accent)] hover:text-accent";

export interface ModuleStackProps {
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
  currentSource: string;
  onApplySource: (source: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetShader: () => void;
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onPickImage: (dataUrl: string) => void;
  texturePath: string;
}

interface OutputModuleProps {
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
}

/** OUTPUT module — everything that leaves the app: still frames + source file. */
function OutputModule({
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
}: OutputModuleProps) {
  return (
    <HudModule
      title="OUTPUT"
      summary={`${width}×${height} · ${screenshotFilename} · ${downloadShaderFilename}`}
    >
      <span className="section-label">Screenshot export</span>
      <div className="flex flex-row flex-wrap items-center gap-2">
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
      <span className="section-label mt-1">Source file</span>
      <TextField
        label="Filename"
        type="text"
        value={downloadShaderFilename}
        aria-label="Shader download filename"
        onChange={onDownloadShaderFilenameChange}
      />
      <Button variant="outlined" onClick={onDownloadShader}>
        Download Shader (<span className="key-hint">Ctrl+S</span>)
      </Button>
    </HudModule>
  );
}

interface InputModuleProps {
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onPickImage: (dataUrl: string) => void;
  texturePath: string;
}

/** INPUT module — how the preview is fed: texture source + compile sync. */
function InputModule({
  autoRun,
  onToggleAutoRun,
  onPickImage,
  texturePath,
}: InputModuleProps) {
  const textureState =
    texturePath === DEFAULT_TEXTURE_PATH ? "default" : "custom image";
  return (
    <HudModule
      title="INPUT"
      summary={`auto-run ${autoRun ? "on" : "off"} · tDiffuse ${textureState}`}
    >
      <Switch
        checked={autoRun}
        onChange={onToggleAutoRun}
        label="Auto-run while typing"
      />
      <div className="btn-shell">
        <label className={PICK_LABEL}>
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
                    onPickImage(dataUrl);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      </div>
    </HudModule>
  );
}

/**
 * Right module stack: collapsed HUD panels whose readout headers report the
 * state of everything hidden inside them.
 */
export function ModuleStack({
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
  currentSource,
  onApplySource,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetShader,
  autoRun,
  onToggleAutoRun,
  onPickImage,
  texturePath,
}: ModuleStackProps) {
  return (
    <aside
      className="flex w-[340px] shrink-0 flex-col gap-2 max-[1100px]:w-full"
      aria-label="Configuration modules"
    >
      <OutputModule
        width={width}
        height={height}
        onWidthChange={onWidthChange}
        onHeightChange={onHeightChange}
        screenshotFilename={screenshotFilename}
        onScreenshotFilenameChange={onScreenshotFilenameChange}
        onCaptureScreenshot={onCaptureScreenshot}
        downloadShaderFilename={downloadShaderFilename}
        onDownloadShaderFilenameChange={onDownloadShaderFilenameChange}
        onDownloadShader={onDownloadShader}
      />
      <ShaderHistory
        currentSource={currentSource}
        onApply={onApplySource}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onResetShader={onResetShader}
      />
      <InputModule
        autoRun={autoRun}
        onToggleAutoRun={onToggleAutoRun}
        onPickImage={onPickImage}
        texturePath={texturePath}
      />
    </aside>
  );
}
