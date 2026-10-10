import React from "react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const FIELD =
  "flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.06em]";
const FIELD_INPUT =
  "well h-6 w-20 px-2 text-[11px] text-ink [font-family:inherit] focus:outline-2 focus-visible:outline-accent";

/** Modal-less settings panel with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="surface-panel flex w-[320px] max-w-[90vw] flex-col text-ink shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        <h2 className="panel-title m-0">
          <span>Settings</span>
          <span className="font-mono text-[10px] tracking-[0.1em] opacity-70">CFG</span>
        </h2>
        <div className="flex flex-col gap-2.5 p-3">
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
          <div className="flex items-center justify-between gap-3">
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
          </div>
          <div className={FIELD}>
            Theme
            <div className="flex">
              <button
                type="button"
                className="seg"
                aria-pressed={settings.themeMode === "light"}
                onClick={() => onChange({ themeMode: "light" })}
              >
                Light
              </button>
              <button
                type="button"
                className="seg"
                aria-pressed={settings.themeMode === "dark"}
                onClick={() => onChange({ themeMode: "dark" })}
              >
                Dark
              </button>
            </div>
          </div>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
