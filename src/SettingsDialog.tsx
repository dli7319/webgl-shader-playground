import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Switch } from "./ui/Switch";
import { ImageIcon } from "./ui/icons";
import { ShaderHistory } from "./ShaderHistory";
import type { ShaderStore } from "./shaderStore";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
  /** Screenshot/export group (one object: size + filename + action). */
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  /** Shader download group (one object: filename + action). */
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  /** Texture pick. */
  onPickImage: (dataUrl: string) => void;
  /** Saved shaders group (one object: name + save + list). */
  shaderStore: ShaderStore;
  currentSource: string;
  onApplySource: (source: string) => void;
  /** Destructive source action. */
  onResetShader: () => void;
}

const FIELD = "flex flex-col gap-1.5 text-sm text-muted";
const FIELD_INPUT = "input-quiet w-24";

/**
 * Right-side config sheet: every secondary control as hairline-separated
 * grouped sections, summarized in the command-strip chip beside its opener.
 */
export function SettingsDialog({
  settings,
  onChange,
  onClose,
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
  shaderStore,
  currentSource,
  onApplySource,
  onResetShader,
}: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex justify-end bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="flex h-full w-[23rem] max-w-full flex-col overflow-y-auto border-l border-edge bg-app text-ink max-[900px]:w-full">
        <div className="flex items-center justify-between gap-2 border-b border-edge px-5 py-3">
          <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Settings</h2>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex flex-col">
          <section className="sheet-section">
            <span className="section-label">Screenshot</span>
            <div className="flex items-center gap-2">
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
          </section>
          <section className="sheet-section">
            <span className="section-label">Shader download</span>
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
          </section>
          <section className="sheet-section">
            <span className="section-label">Texture</span>
            <label className="btn btn-quiet cursor-pointer">
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
          </section>
          <section className="sheet-section">
            <ShaderHistory
              store={shaderStore}
              currentSource={currentSource}
              onApply={onApplySource}
            />
          </section>
          <section className="sheet-section">
            <span className="section-label">Editor</span>
            <label className={FIELD}>
              Editor font size
              <input
                type="number"
                min={8}
                max={32}
                value={settings.editorFontSize}
                aria-label="Editor font size"
                className={FIELD_INPUT}
                onChange={(e) =>
                  onChange({
                    editorFontSize: Number((e.target as HTMLInputElement).value),
                  })
                }
              />
            </label>
            <Switch
              checked={settings.wordWrap}
              onChange={() => onChange({ wordWrap: !settings.wordWrap })}
              label="Word wrap"
            />
            <Switch
              checked={settings.autoRun}
              onChange={() => onChange({ autoRun: !settings.autoRun })}
              label="Auto-run while typing"
            />
          </section>
          <section className="sheet-section">
            <span className="section-label">Appearance</span>
            <div className={FIELD}>
              Theme
              <div>
                <Button
                  variant="outlined"
                  className={settings.themeMode === "light" ? "btn-selected" : ""}
                  onClick={() => onChange({ themeMode: "light" })}
                >
                  Light
                </Button>{" "}
                <Button
                  variant="outlined"
                  className={settings.themeMode === "dark" ? "btn-selected" : ""}
                  onClick={() => onChange({ themeMode: "dark" })}
                >
                  Dark
                </Button>
              </div>
            </div>
          </section>
          <section className="sheet-section">
            <span className="section-label">Source</span>
            <Button variant="outlined" tone="danger" onClick={onResetShader}>
              Reset to default shader
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
