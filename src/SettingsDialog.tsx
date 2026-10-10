import React from "react";

import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const FIELD = "flex flex-col gap-1.5 text-sm";
const FIELD_INPUT =
  "w-24 rounded-xl border-none bg-panel px-2.5 py-[0.4rem] text-ink shadow-[var(--shadow-inset-sm)] [font:inherit] focus:shadow-[var(--shadow-inset)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Modal-less settings panel with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="surface-panel flex min-w-[280px] flex-col gap-3 px-6 py-5 text-ink">
        <h2 className="m-0 text-lg font-bold tracking-[0.01em]">Settings</h2>
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
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
