import React from "react";
import { DockSheet } from "./DockSheet";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { ImageIcon } from "./ui/icons";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  textureLabel: string;
  onChange: (patch: Partial<Settings>) => void;
  onPickImage: (dataUrl: string, fileName: string) => void;
  onResetShader: () => void;
  onClose: () => void;
}

const FIELD = "flex flex-col gap-1.5 text-sm";
const FIELD_INPUT =
  "w-24 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-[0.35rem] text-ink [font:inherit] focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Settings sheet behind the dock: preferences, texture, and the danger row. */
export function SettingsDialog({
  settings,
  textureLabel,
  onChange,
  onPickImage,
  onResetShader,
  onClose,
}: SettingsDialogProps) {
  return (
    <DockSheet title="Settings" onClose={onClose}>
      <div className="sheet-group">
        <span className="sheet-group-label">Editor</span>
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
        <div className={FIELD}>
          Theme
          <div>
            <Button
              variant={settings.themeMode === "light" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "light" })}
            >
              Light
            </Button>{" "}
            <Button
              variant={settings.themeMode === "dark" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "dark" })}
            >
              Dark
            </Button>
          </div>
        </div>
      </div>
      <div className="sheet-group">
        <span className="sheet-group-label">Texture</span>
        <p className="sheet-note">tDiffuse: {textureLabel}</p>
        <label className="btn self-start">
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
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result;
                  if (typeof dataUrl === "string") {
                    onPickImage(dataUrl, file.name);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      </div>
      <div className="sheet-group">
        <span className="sheet-group-label">Danger zone</span>
        <Button variant="outlined" tone="warning" onClick={onResetShader}>
          Reset to default shader
        </Button>
        <p className="sheet-note">
          Restores the default fragment shader (asks for confirmation first).
        </p>
      </div>
    </DockSheet>
  );
}
