import React from "react";

import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const FIELD = "flex flex-col gap-2 text-[13px] font-medium text-quiet";
const FIELD_INPUT =
  "w-28 rounded-lg border border-edge-strong bg-panel px-3 py-2 text-sm text-ink [font:inherit] focus:border-accent focus:shadow-[0_0_0_3px_var(--focus-ring)]";

/** Modal-less settings panel with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="flex w-[min(420px,90vw)] flex-col gap-5 rounded-2xl border border-edge bg-panel p-6 text-ink shadow-[var(--shadow-lift)]">
        <h2 className="m-0 text-[20px] font-semibold tracking-[-0.01em]">Settings</h2>
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
          <div className="flex items-center gap-2">
            <Button
              variant={settings.themeMode === "light" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "light" })}
            >
              Light
            </Button>
            <Button
              variant={settings.themeMode === "dark" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "dark" })}
            >
              Dark
            </Button>
          </div>
        </div>
        <Button variant="contained" className="mt-1" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
