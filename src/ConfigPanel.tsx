import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Switch } from "./ui/Switch";
import { ImageIcon } from "./ui/icons";

export interface ConfigPanelProps {
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
  onPickImage: (dataUrl: string) => void;
  textureLabel: string;
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onResetShader: () => void;
  onOpenSettings: () => void;
}

const FILE_PICKER_LABEL =
  "edge-accent inline-flex min-h-9 min-w-16 cursor-pointer items-center justify-center gap-2 rounded-[2px] px-4 py-[0.45rem] font-display text-[1.15rem] leading-none uppercase tracking-[0.14em] text-accent glow transition-colors hover:bg-accent hover:text-on-accent hover:shadow-[0_0_12px_var(--glow)]";

const GROUP_LABEL = "flex items-baseline gap-2";

/**
 * Toggled config drawer. Each object keeps its controls together: capture
 * (size + filename + Screenshot!), shader file (filename + Download), and
 * texture, followed by the session-level switches and the destructive reset.
 * All state is summarised beside the CONFIG key and in the status strip.
 */
export function ConfigPanel({
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
  onPickImage,
  textureLabel,
  autoRun,
  onToggleAutoRun,
  onResetShader,
  onOpenSettings,
}: ConfigPanelProps) {
  return (
    <div id="config-drawer" className="drawer" role="region" aria-label="Config panel">
      <div className="flex min-w-0 flex-wrap items-baseline gap-2" aria-hidden="true">
        <span className="section-label">Config</span>
        <span className="micro-label grow opacity-60">
          capture · shader file · texture · session
        </span>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <div className="object-group grow">
          <div className={GROUP_LABEL} aria-hidden="true">
            <span className="section-label">Capture</span>
            <span className="micro-label grow opacity-60">png export</span>
          </div>
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
            <TextField
              label="Filename"
              type="text"
              className="grow"
              value={screenshotFilename}
              aria-label="Screenshot filename"
              onChange={onScreenshotFilenameChange}
            />
            <Button className="grow" variant="outlined" onClick={onCaptureScreenshot}>
              Screenshot!
            </Button>
          </div>
        </div>
        <div className="object-group grow">
          <div className={GROUP_LABEL} aria-hidden="true">
            <span className="section-label">Shader file</span>
            <span className="micro-label grow opacity-60">.frag download</span>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            <TextField
              label="Filename"
              type="text"
              className="grow"
              value={downloadShaderFilename}
              aria-label="Shader download filename"
              onChange={onDownloadShaderFilenameChange}
            />
            <Button variant="outlined" onClick={onDownloadShader}>
              Download Shader (Ctrl+S)
            </Button>
          </div>
        </div>
        <div className="object-group grow">
          <div className={GROUP_LABEL} aria-hidden="true">
            <span className="section-label">Texture</span>
            <span className="micro-label grow opacity-60">{textureLabel}</span>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2">
            <label className={FILE_PICKER_LABEL}>
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
        </div>
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2">
        <Switch
          checked={autoRun}
          onChange={onToggleAutoRun}
          label="Auto-run while typing"
        />
        <Button variant="outlined" tone="danger" onClick={onResetShader}>
          Reset to default shader
        </Button>
        <Button variant="outlined" onClick={onOpenSettings}>
          Settings
        </Button>
      </div>
    </div>
  );
}
